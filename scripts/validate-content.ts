import { loadAllCourses, loadAllProblems } from "./lib/content";
import { runCodeInNodeWorker } from "../src/lib/sandbox/node-runner";
import type { SandboxTest } from "../src/lib/sandbox/shared";

async function assertSolutionPasses(
  label: string,
  exercise: { referenceSolution: string; functionName: string; tests: SandboxTest[] },
) {
  const result = await runCodeInNodeWorker({
    code: exercise.referenceSolution,
    functionName: exercise.functionName,
    tests: exercise.tests,
  });
  if (!result.passed) {
    const failing = result.results.find((test) => !test.passed);
    throw new Error(
      `${label} has a failing reference solution` +
        (failing
          ? ` (test "${failing.name}": ${failing.error ?? `expected ${JSON.stringify(failing.expected)}, got ${JSON.stringify(failing.actual)}`})`
          : ""),
    );
  }
}

async function main() {
  const courses = await loadAllCourses();
  let exercises = 0;
  for (const course of courses) {
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        for (const item of lesson.knowledgeItems) {
          if (item.type !== "CODE") continue;
          exercises += 1;
          await assertSolutionPasses(`${course.slug} / ${lesson.title} / ${item.prompt}`, item.payload);
        }
      }
    }
  }

  const problems = await loadAllProblems();
  for (const problem of problems) {
    await assertSolutionPasses(`problem "${problem.slug}"`, problem);
  }

  console.log(
    `Validated ${courses.length} courses (${exercises} lesson exercises) and ${problems.length} standalone problems.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
