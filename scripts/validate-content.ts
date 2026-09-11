import { cpus } from "node:os";
import { loadAllCourses, loadAllProblems } from "./lib/content";
import { runCodeInNodeWorker } from "../src/lib/sandbox/node-runner";
import type { SandboxTest } from "../src/lib/sandbox/shared";

interface Exercise {
  referenceSolution: string;
  functionName: string;
  tests: SandboxTest[];
}

async function checkSolution(label: string, exercise: Exercise): Promise<string | null> {
  let result;
  try {
    result = await runCodeInNodeWorker({
      code: exercise.referenceSolution,
      functionName: exercise.functionName,
      tests: exercise.tests,
    });
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
 * Each check spawns a Node worker (~1s of cold start on Windows), so running
 * the few hundred exercises serially took ~10 minutes. Run a bounded pool
 * instead -- the checks are independent and CI runs this on every push.
 */
async function runPool<T>(items: T[], limit: number, run: (item: T) => Promise<string | null>) {
  const failures: string[] = [];
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      const failure = await run(item);
      if (failure) failures.push(failure);
    }
  });

  await Promise.all(workers);
  return failures;
}

async function main() {
  const [courses, problems] = await Promise.all([loadAllCourses(), loadAllProblems()]);

  const checks: { label: string; exercise: Exercise }[] = [];

  for (const course of courses) {
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        for (const item of lesson.knowledgeItems) {
          if (item.type !== "CODE") continue;
          checks.push({
            label: `${course.slug} / ${lesson.title} / ${item.prompt}`,
            exercise: item.payload as Exercise,
          });
        }
      }
    }
  }

  const lessonExercises = checks.length;
  for (const problem of problems) {
    checks.push({ label: `problem "${problem.slug}"`, exercise: problem });
  }

  const concurrency = Math.max(2, Math.min(8, cpus().length));
  const failures = await runPool(checks, concurrency, ({ label, exercise }) => checkSolution(label, exercise));

  if (failures.length > 0) {
    for (const failure of failures.sort()) console.error(failure);
    throw new Error(`${failures.length} of ${checks.length} reference solutions failed.`);
  }

  console.log(
    `Validated ${courses.length} courses (${lessonExercises} lesson exercises) and ${problems.length} standalone problems.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
