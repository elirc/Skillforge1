import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { courseSeedSchema } from "../src/lib/content-schema";
import { runCodeInNodeWorker } from "../src/lib/sandbox/node-runner";

async function main() {
  const dir = join(process.cwd(), "content", "courses");
  const files = (await readdir(dir)).filter((file) => file.endsWith(".json"));
  for (const file of files) {
    const raw = await readFile(join(dir, file), "utf8");
    const course = courseSeedSchema.parse(JSON.parse(raw));
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        for (const item of lesson.knowledgeItems) {
          if (item.type !== "CODE") continue;
          const result = await runCodeInNodeWorker({
            code: item.payload.referenceSolution,
            functionName: item.payload.functionName,
            tests: item.payload.tests,
          });
          if (!result.passed) {
            throw new Error(`${file} / ${lesson.title} has a failing reference solution: ${item.prompt}`);
          }
        }
      }
    }
  }
  console.log(`Validated ${files.length} course files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
