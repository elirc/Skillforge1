import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

const identity = value => `sf_${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
const slug = title => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
async function json(path, value) {
  try { const previous = JSON.parse(await readFile(path, "utf8")); if (previous.id) value.id = previous.id; } catch {}
  await writeFile(path, JSON.stringify(value, null, 2) + "\n");
}

/** Explicit lesson definitions supply the teaching, fixtures and solutions. */
export async function writeCourse(meta, lessons) {
  const directory = join("content", meta.slug);
  await mkdir(directory, { recursive: true });
  await json(join(directory, "course.json"), { version: "2", prerequisites: [], ...meta });
  const moduleDirectory = join(directory, "01-practical-labs");
  await mkdir(moduleDirectory, { recursive: true });
  await json(join(moduleDirectory, "module.json"), { id: identity(`${meta.slug}/labs`), title: meta.moduleTitle ?? "Learn, trace, and build" });
  for (const [index, lesson] of lessons.entries()) {
    const key = `${String(index + 1).padStart(2, "0")}-${slug(lesson.title)}`;
    const lessonDirectory = join(moduleDirectory, key);
    await mkdir(lessonDirectory, { recursive: true });
    let id = identity(`${meta.slug}/${key}`);
    try { id = JSON.parse(await readFile(join(lessonDirectory, "lesson.json"), "utf8")).id ?? id; } catch {}
    const extension = lesson.extension ?? (meta.language === "csharp" ? "cs" : meta.language === "sql" ? "sql" : "ts");
    const tests = lesson.tests.map((test, i) => ({ ...test, hidden: test.hidden ?? i >= 2 }));
    const example = tests[0];
    const blocks = [
      { type: "prose", body: lesson.teaching },
      { type: "code-example", language: extension, code: lesson.example ?? lesson.starter },
      { type: "prose", body: lesson.trace ?? `**Trace the contract.** In the first case, the input is ${JSON.stringify(example.args)}. The required result is ${JSON.stringify(example.expected)}. Before running code, explain which input values contribute to the result and which are excluded. Then change one boundary value and predict whether the result changes.\n\n**Your task.** ${lesson.task}` },
      { type: "callout", tone: "warning", body: lesson.pitfall },
      { type: "prose", body: `**Check your understanding.** ${lesson.reflect} Write the reason in your own words before opening the solution. Run the additional cases as well as the visible example: the ${tests.at(-1).name} case checks a different boundary.\n\n**Transfer it.** ${lesson.transfer}` },
    ];
    if (extension === "sql") blocks.splice(1, 0, { type: "code-example", language: "sql", code: example.args[0].setup });
    await json(join(lessonDirectory, "lesson.json"), {
      id, title: lesson.title, estimatedMinutes: lesson.minutes ?? 12, contentBlocks: blocks,
      knowledgeItems: [
        { id: identity(`${id}/recall`), type: "MCQ", prompt: lesson.question, conceptTags: lesson.tags, payload: { choices: [lesson.answer, ...lesson.distractors], answer: lesson.answer, explanation: lesson.reason } },
        { id: identity(`${id}/practice`), type: "CODE", prompt: lesson.task, conceptTags: lesson.tags, exercise: "practice", ...(lesson.language ? { language: lesson.language } : {}), hints: lesson.hints, regression: lesson.regression, walkthrough: lesson.walkthrough ?? `${lesson.reason}\n${lesson.pitfall}` },
      ],
    });
    const source = code => {
      if (extension !== "tsx") return code + "\n";
      const hooks = ["useState", "useEffect", "useRef", "useMemo", "useReducer", "useId"].filter(hook => code.includes(hook));
      return (hooks.length ? `import { ${hooks.join(", ")} } from "react";\n` : "") + code.replace(/^function App/m, "export function App") + "\n";
    };
    await writeFile(join(lessonDirectory, `practice.starter.${extension}`), source(lesson.starter));
    await writeFile(join(lessonDirectory, `practice.solution.${extension}`), source(lesson.solution));
    await writeFile(join(lessonDirectory, "practice.tests.ts"), `export const functionName = ${JSON.stringify(lesson.functionName ?? "Evaluate")};\nexport const tests = ${JSON.stringify(tests, null, 2)};\n`);
  }
  console.log(`Authored ${meta.slug}: ${lessons.length} lessons.`);
}
