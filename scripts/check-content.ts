/**
 * Low-memory, targeted content check for authors.
 *
 *   npx tsx scripts/check-content.ts --course sql-foundations --problem-prefix sql-
 *
 * Flags (repeatable): --course <slug>, --problem <slug>, --problem-prefix <prefix>.
 * Runs every selected exercise one at a time and checks that:
 *   - the reference solution passes every test,
 *   - the starter builds but fails at least one test,
 *   - every MCQ answer is one of its choices,
 *   - every CLOZE has exactly one `____` and one blank (the player grades blanks[0]),
 *   - every lesson has at least one knowledge item (otherwise it can't be completed).
 * `npm run validate:content` remains the full gate; this is for quick, scoped runs.
 */
import { loadAllCourses, loadAllProblems } from "./lib/content";
import { CsharpRunnerHost, isCsharpRunnerBuilt } from "./lib/csharp-runner";
import { runCodeInNodeWorker } from "../src/lib/sandbox/node-runner";
import type { SandboxTest } from "../src/lib/sandbox/shared";

interface Exercise {
  referenceSolution: string;
  starterCode: string;
  functionName: string;
  tests: SandboxTest[];
}

function parseArgs(argv: string[]) {
  const courses: string[] = [];
  const problems: string[] = [];
  const prefixes: string[] = [];
  for (let i = 0; i < argv.length; i += 2) {
    const [flag, value] = [argv[i], argv[i + 1]];
    if (!value) throw new Error(`Missing value for ${flag}`);
    if (flag === "--course") courses.push(value);
    else if (flag === "--problem") problems.push(value);
    else if (flag === "--problem-prefix") prefixes.push(value);
    else throw new Error(`Unknown flag ${flag}`);
  }
  return { courses, problems, prefixes };
}

async function main() {
  const { courses: courseSlugs, problems: problemSlugs, prefixes } = parseArgs(process.argv.slice(2));
  // Load only what was asked for: other authors' half-written content must not
  // break this run, and loading everything costs memory this machine lacks.
  const wantsProblems = problemSlugs.length > 0 || prefixes.length > 0;
  const courses = courseSlugs.length > 0 ? await loadAllCourses(courseSlugs) : [];
  const problems = wantsProblems
    ? await loadAllProblems((name) => problemSlugs.includes(name) || prefixes.some((prefix) => name.startsWith(prefix)))
    : [];
  const failures: string[] = [];
  const checks: { label: string; exercise: Exercise; csharp: boolean }[] = [];

  for (const slug of courseSlugs) {
    const course = courses.find((entry) => entry.slug === slug);
    if (!course) {
      failures.push(`course "${slug}" not found`);
      continue;
    }
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        const where = `${slug} / ${courseModule.title} / ${lesson.title}`;
        if (lesson.knowledgeItems.length === 0) failures.push(`${where}: no knowledge items`);
        for (const item of lesson.knowledgeItems) {
          if (item.type === "MCQ" && !item.payload.choices.includes(item.payload.answer)) {
            failures.push(`${where}: MCQ answer not among choices ("${item.prompt}")`);
          }
          if (item.type === "CLOZE") {
            const gaps = item.payload.text.split("____").length - 1;
            if (gaps !== 1 || item.payload.blanks.length !== 1) {
              failures.push(`${where}: CLOZE must have exactly one ____ and one blank ("${item.prompt}")`);
            }
          }
          if (item.type === "CODE") {
            checks.push({ label: `${where} / ${item.prompt}`, exercise: item.payload, csharp: item.payload.language === "csharp" });
          }
        }
      }
    }
  }

  const selected = problems.filter(
    (problem) => problemSlugs.includes(problem.slug) || prefixes.some((prefix) => problem.slug.startsWith(prefix)),
  );
  for (const slug of problemSlugs) {
    if (!problems.some((problem) => problem.slug === slug)) failures.push(`problem "${slug}" not found`);
  }
  for (const problem of selected) {
    checks.push({ label: `problem "${problem.slug}"`, exercise: problem, csharp: problem.runtime === "csharp" });
  }

  let host: CsharpRunnerHost | null = null;
  try {
    for (const { label, exercise, csharp } of checks) {
      if (csharp) {
        if (!isCsharpRunnerBuilt()) {
          failures.push(`${label}: C# runner not built (npm run csharp:build)`);
          continue;
        }
        host ??= new CsharpRunnerHost();
        const solution = await host.run(exercise.referenceSolution, exercise.functionName, exercise.tests);
        if (solution.compileErrors?.length) failures.push(`${label}: solution does not compile (${solution.compileErrors[0].message})`);
        else if (!solution.passed) failures.push(`${label}: solution fails "${solution.results.find((r) => !r.passed)?.name}"`);
        const starter = await host.run(exercise.starterCode, exercise.functionName, exercise.tests);
        if (starter.compileErrors?.length) failures.push(`${label}: starter does not compile (${starter.compileErrors[0].message})`);
        else if (starter.passed) failures.push(`${label}: starter already passes every test`);
      } else {
        const solution = await runCodeInNodeWorker({ code: exercise.referenceSolution, functionName: exercise.functionName, tests: exercise.tests });
        if (!solution.passed) {
          const bad = solution.results.find((r) => !r.passed);
          failures.push(`${label}: solution fails "${bad?.name}" (${bad?.error ?? `expected ${JSON.stringify(bad?.expected)}, got ${JSON.stringify(bad?.actual)}`})`);
        }
        const starter = await runCodeInNodeWorker({ code: exercise.starterCode, functionName: exercise.functionName, tests: exercise.tests }).catch(
          (error: unknown) => ({ passed: false, results: [], error }),
        );
        if (starter.passed) failures.push(`${label}: starter already passes every test`);
      }
    }
  } finally {
    host?.stop();
  }

  if (failures.length > 0) {
    for (const failure of failures) console.error(failure);
    console.error(`${failures.length} problem(s) in ${checks.length} exercise(s).`);
    process.exit(1);
  }
  console.log(`OK: ${checks.length} exercise(s) checked.`);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
