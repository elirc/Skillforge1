import { loadAllCourses, loadAllProblems } from "./lib/content";
import { CsharpRunnerHost, isCsharpRunnerBuilt } from "./lib/csharp-runner";
import { runCodeInNodeWorker } from "../src/lib/sandbox/node-runner";
import type { SandboxTest } from "../src/lib/sandbox/shared";
import { compileTypeScript } from "../src/lib/sandbox/typescript-compiler";
import { runSqlInNode } from "./lib/sql-runner";
import { runReactInNode } from "./lib/react-runner";

interface Exercise {
  referenceSolution: string;
  starterCode: string;
  functionName: string;
  tests: SandboxTest[];
  typeChecks?: string;
  regression?: { factoryName: string; referenceCode: string; mutants: string[] };
  language?: "javascript" | "typescript" | "csharp" | "sql" | "react";
}

interface Check {
  label: string;
  exercise: Exercise;
  /**
   * Which sandbox grades it. Taken from the exercise files, never from a
   * problem's catalog `language` -- the C#-themed problems in the problem bank
   * are authored and answered in TypeScript.
   */
  runtime: "javascript" | "typescript" | "csharp" | "sql" | "react";
}

async function checkJavaScript(label: string, exercise: Exercise, runtime: Check["runtime"]): Promise<string | null> {
  let result;
  try {
    let solution = exercise.referenceSolution;
    let starter = exercise.starterCode;
    if (runtime === "typescript") {
      const compiled = compileTypeScript(solution + (exercise.typeChecks ? `\n${exercise.typeChecks}` : ""));
      const initial = compileTypeScript(starter + (exercise.typeChecks ? `\n${exercise.typeChecks}` : ""));
      if (compiled.diagnostics.length) return `${label}: solution ${compiled.diagnostics.map(d => `${d.id} line ${d.line}: ${d.message}`).join("; ")}`;
      if (exercise.typeChecks) return initial.diagnostics.length ? null : `${label}: compile-only starter already satisfies the contract.`;
      if (initial.diagnostics.length) return `${label}: starter ${initial.diagnostics.map(d => `${d.id} line ${d.line}: ${d.message}`).join("; ")}`;
      solution = compiled.code;
      starter = initial.code;
    }
    const run = runtime === "sql" ? runSqlInNode : runtime === "react" ? runReactInNode : runCodeInNodeWorker;
    result = await run({
      code: solution,
      functionName: exercise.functionName,
      tests: exercise.tests,
      regression: exercise.regression,
    });
    try {
      const starting = await run({ code: starter, functionName: exercise.functionName, tests: exercise.tests, regression: exercise.regression });
      if (starting.passed) return `${label}: starter already passes every test; strengthen the task or fixtures.`;
    } catch { /* An unfinished starter may throw; the reference must still pass. */ }
  } catch (error) {
    return `${label}: ${error instanceof Error ? error.message : String(error)}`;
  }

  if (result.passed) return null;

  const failing = result.results.find((test) => !test.passed);
  return (
    `${label} has a failing reference solution` +
    (failing
      ? ` (test "${failing.name}": ${failing.error ?? `expected ${JSON.stringify(failing.expected)}, got ${JSON.stringify(failing.actual)}`})`
      : "")
  );
}

/**
 * C# exercises get a stricter check than JavaScript ones: the starter must
 * compile (so a learner never opens a lesson that is red before they type) and
 * the solution must pass. Compiling authored C# is the only lint it gets.
 */
async function checkCsharp(host: CsharpRunnerHost, label: string, exercise: Exercise): Promise<string | null> {
  try {
    const starter = await host.run(exercise.starterCode, exercise.functionName, []);
    if (starter.compileErrors?.length) {
      const first = starter.compileErrors[0];
      return `${label} has a starter that does not compile (${first.id} line ${first.line}: ${first.message})`;
    }

    const solution = await host.run(exercise.referenceSolution, exercise.functionName, exercise.tests);
    if (solution.compileErrors?.length) {
      const first = solution.compileErrors[0];
      return `${label} has a solution that does not compile (${first.id} line ${first.line}: ${first.message})`;
    }
    if (solution.passed) return null;

    const failing = solution.results.find((test) => !test.passed);
    return (
      `${label} has a failing reference solution` +
      (failing
        ? ` (test "${failing.name}": ${failing.error ?? `expected ${JSON.stringify(failing.expected)}, got ${JSON.stringify(failing.actual)}`})`
        : "")
    );
  } catch (error) {
    return `${label}: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * Each JavaScript check spawns a Node worker (~1s of cold start on Windows), so
 * running the few hundred exercises serially took ~10 minutes. Run a bounded
 * pool instead -- the checks are independent and CI runs this on every push.
 */
async function runPool<T>(items: T[], limit: number, run: (item: T) => Promise<string | null>) {
  const failures: string[] = [];
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      const failure = await run(item);
      if (failure) { failures.push(failure); console.error(failure); }
      if (cursor % 10 === 0) console.log(`Checked ${cursor}/${items.length} non-C# exercises.`);
    }
  });

  await Promise.all(workers);
  return failures;
}

async function main() {
  const only = process.env.SKILLFORGE_CONTENT_COURSES?.split(",");
  const [courses, problems] = await Promise.all([loadAllCourses(only), only ? Promise.resolve([]) : loadAllProblems()]);

  const checks: Check[] = [];

  for (const course of courses) {
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        for (const item of lesson.knowledgeItems) {
          if (item.type !== "CODE") continue;
          const payload = item.payload as Exercise;
          checks.push({
            label: `${course.slug} / ${lesson.title} / ${item.prompt}`,
            exercise: payload,
            runtime: payload.language ?? "javascript",
          });
        }
      }
    }
  }

  const lessonExercises = checks.length;
  for (const problem of problems) {
    checks.push({
      label: `problem "${problem.slug}"`,
      exercise: problem as unknown as Exercise,
      runtime: problem.runtime,
    });
  }

  const csharpChecks = checks.filter((check) => check.runtime === "csharp");
  const jsChecks = checks.filter((check) => check.runtime !== "csharp");

  const concurrency = Math.max(1, Math.min(4, Number(process.env.SKILLFORGE_CONTENT_WORKERS) || 1));
  const failures = await runPool(jsChecks, concurrency, ({ label, exercise, runtime }) => checkJavaScript(label, exercise, runtime));

  // The .NET host is expensive to start and cheap per run, so C# checks share
  // one process and run in sequence rather than in a pool.
  if (csharpChecks.length > 0) {
    if (process.env.SKILLFORGE_SKIP_CSHARP === "1") {
      console.warn(`Skipping ${csharpChecks.length} C# exercise(s): SKILLFORGE_SKIP_CSHARP=1.`);
    } else if (!isCsharpRunnerBuilt()) {
      failures.push(
        `${csharpChecks.length} C# exercise(s) could not be checked: the runner is not built. ` +
          "Run `npm run csharp:build`, or set SKILLFORGE_SKIP_CSHARP=1 to skip them.",
      );
    } else {
      const host = new CsharpRunnerHost();
      try {
        for (const { label, exercise } of csharpChecks) {
          const failure = await checkCsharp(host, label, exercise);
          if (failure) failures.push(failure);
        }
      } finally {
        host.stop();
      }
    }
  }

  if (failures.length > 0) {
    for (const failure of failures.sort()) console.error(failure);
    throw new Error(`${failures.length} of ${checks.length} reference solutions failed.`);
  }

  console.log(
    `Validated ${courses.length} courses (${lessonExercises} lesson exercises) ` +
      `and ${problems.length} standalone problems; ${csharpChecks.length} C# checks across both groups.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
