/**
 * Build-time content loader.
 *
 * Walks the `content/<course>/<NN-module>/<NN-lesson>/` tree, reads the JSON
 * lesson definitions, and compiles each code exercise's real TypeScript files
 * (`<key>.starter.ts` / `<key>.solution.ts` / `<key>.tests.ts`) into the
 * `CODE` payload that `courseSeedSchema` expects. The assembled course is then
 * validated with that schema so a malformed lesson fails fast.
 *
 * This module is only ever run under `tsx` (seed + validate scripts). It is
 * never imported by the Next.js app, which reads finished content from the DB.
 */
import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import ts from "typescript";
import { courseSeedSchema, problemSeedSchema, type CourseSeed, type ProblemSeed } from "../../src/lib/content-schema";

const CONTENT_DIR = join(process.cwd(), "content");
const PROBLEMS_DIR = join(CONTENT_DIR, "problems");

/** Modules and lessons take their order from a leading number in the directory name. */
function orderFromName(name: string): number {
  const match = name.match(/^(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

/** Directory entries, ignoring files, tooling (`_authoring`), and dotfiles, sorted by order prefix. */
async function listDirs(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => orderFromName(a) - orderFromName(b) || a.localeCompare(b));
}

async function readJson<T = Record<string, unknown>>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Strip module `export` syntax so the source can run inside the `new Function` sandbox harness. */
function stripExports(source: string): string {
  return source
    .replace(/^\s*export\s+\{[^}]*\};?\s*$/gm, "")
    .replace(/^(\s*)export\s+default\s+/gm, "$1")
    .replace(/^(\s*)export\s+(?=(async\s+)?(function|const|let|var|class)\b)/gm, "$1");
}

/** Transpile authored TypeScript to plain JS suitable for the sandbox (types and exports removed). */
function transpileToSandbox(source: string): string {
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
  return `${stripExports(output).trim()}\n`;
}

interface AuthoredKnowledgeItem {
  id?: string;
  type: "MCQ" | "CLOZE" | "CODE";
  prompt: string;
  conceptTags: string[];
  payload?: unknown;
  /** For CODE items: the file prefix of the `.starter.ts` / `.solution.ts` / `.tests.ts` trio. */
  exercise?: string;
  hints?: string[];
  walkthrough?: string;
  typeChecks?: string;
  regression?: { factoryName: string; referenceCode: string; mutants: string[] };
  language?: "javascript" | "typescript";
}

interface ExerciseTestsModule {
  functionName: string;
  tests: unknown;
}

/**
 * An exercise is authored as a starter/solution pair plus a TypeScript tests
 * module. TypeScript exercises are transpiled for the browser sandbox; C# ones
 * are handed to the .NET runner verbatim, so their source is read as-is.
 * The tests module stays TypeScript in both cases -- the cases are plain JSON
 * values either way, and authoring them in TS keeps them type-checked.
 */
async function buildCodePayload(lessonDir: string, key: string, typed = false) {
  const isCsharp = await exists(join(lessonDir, `${key}.starter.cs`));
  const isSql = await exists(join(lessonDir, `${key}.starter.sql`));
  const isReact = await exists(join(lessonDir, `${key}.starter.tsx`));
  if (isCsharp && (await exists(join(lessonDir, `${key}.starter.ts`)))) {
    throw new Error(`Exercise "${key}" in ${lessonDir} has both a .cs and a .ts starter; pick one language.`);
  }

  const extension = isCsharp ? "cs" : isSql ? "sql" : isReact ? "tsx" : "ts";
  const [starterSrc, solutionSrc, testsSrc] = await Promise.all([
    readFile(join(lessonDir, `${key}.starter.${extension}`), "utf8"),
    readFile(join(lessonDir, `${key}.solution.${extension}`), "utf8"),
    readFile(join(lessonDir, `${key}.tests.ts`), "utf8"),
  ]);
  // These are trusted, repository-authored fixtures. Avoid hundreds of tsx
  // module imports, which retain compiler state during a full catalog load.
  const testsModule = new Function(`${transpileToSandbox(testsSrc)}; return { functionName, tests };`)() as ExerciseTestsModule;
  const preserveSource = isCsharp || isSql || isReact || typed;
  const source = (value: string) => isReact ? value.replace(/^import\s+.*?from\s+["']react["'];?\s*$/gm, "") : typed ? value.replace(/^\s*export\s+/gm, "") : value;

  return {
    starterCode: preserveSource ? source(starterSrc) : transpileToSandbox(starterSrc),
    functionName: testsModule.functionName,
    tests: testsModule.tests,
    referenceSolution: preserveSource ? source(solutionSrc) : transpileToSandbox(solutionSrc),
    language: isCsharp ? "csharp" as const : isSql ? "sql" as const : isReact ? "react" as const : typed ? "typescript" as const : "javascript" as const,
  };
}

async function loadLesson(lessonDir: string, order: number) {
  const raw = await readJson<{ id?: string; estimatedMinutes?: number; prerequisites?: string[]; title: string; contentBlocks: unknown[]; knowledgeItems: AuthoredKnowledgeItem[] }>(
    join(lessonDir, "lesson.json"),
  );

  const knowledgeItems = [];
  for (const item of raw.knowledgeItems ?? []) {
    if (item.type === "CODE") {
      if (!item.exercise) {
        throw new Error(`CODE item "${item.prompt}" in ${lessonDir} is missing an "exercise" key.`);
      }
      knowledgeItems.push({
        id: item.id,
        type: "CODE",
        prompt: item.prompt,
        conceptTags: item.conceptTags,
        payload: { ...await buildCodePayload(lessonDir, item.exercise, item.language === "typescript" || lessonDir.includes("typescript-starter")), hints: item.hints ?? [], walkthrough: item.walkthrough, regression: item.regression, typeChecks: item.typeChecks },
      });
    } else {
      knowledgeItems.push(item);
    }
  }

  return { ...raw, order, knowledgeItems };
}

/**
 * Bounded-concurrency map that preserves input order.
 *
 * Loading a single exercise costs ~0.8s (three TypeScript transpiles plus a
 * dynamic `import()` of the tests module under tsx). With a few hundred
 * problems that is minutes of wall clock if done one at a time, and both the
 * seed and the content validator pay it. The directories are independent, so
 * run a pool over them.
 */
async function mapWithConcurrency<T, R>(items: T[], limit: number, run: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await run(items[index]);
    }
  });

  await Promise.all(workers);
  return results;
}

const LOAD_CONCURRENCY = 2;

/**
 * `only` limits loading to these course directory names (which match slugs),
 * so a scoped check neither pays for nor trips over unrelated content.
 */
export async function loadAllCourses(only?: string[]): Promise<CourseSeed[]> {
  const courses: CourseSeed[] = [];

  for (const courseName of await listDirs(CONTENT_DIR)) {
    if (only && !only.includes(courseName)) continue;
    const courseDir = join(CONTENT_DIR, courseName);
    // Skip directories that are not courses (e.g. tooling or legacy folders).
    if (!(await exists(join(courseDir, "course.json")))) continue;
    const meta = await readJson(join(courseDir, "course.json"));

    const modules = [];
    for (const moduleName of await listDirs(courseDir)) {
      const moduleDir = join(courseDir, moduleName);
      const moduleMeta = await readJson<{ id?: string; title: string }>(join(moduleDir, "module.json"));

      const lessons = await mapWithConcurrency(await listDirs(moduleDir), LOAD_CONCURRENCY, (lessonName) =>
        loadLesson(join(moduleDir, lessonName), orderFromName(lessonName)),
      );

      modules.push({ ...moduleMeta, order: orderFromName(moduleName), lessons });
    }

    try {
      courses.push(courseSeedSchema.parse({ ...meta, modules }));
    } catch (error) {
      throw new Error(`Course "${courseName}" failed validation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return courses.sort((a, b) => a.order - b.order);
}

/**
 * Standalone practice problems, independent of any lesson. Each lives in
 * `content/problems/<slug>/` with a `problem.json` plus the same
 * `<exercise>.starter.ts` / `.solution.ts` / `.tests.ts` trio used by lessons.
 */
export async function loadAllProblems(include?: (directoryName: string) => boolean): Promise<ProblemSeed[]> {
  if (!(await exists(PROBLEMS_DIR))) return [];

  const loaded = await mapWithConcurrency(
    (await listDirs(PROBLEMS_DIR)).filter((name) => !include || include(name)),
    LOAD_CONCURRENCY,
    async (problemName): Promise<ProblemSeed | null> => {
      const problemDir = join(PROBLEMS_DIR, problemName);
      if (!(await exists(join(problemDir, "problem.json")))) return null;

      const meta = await readJson<{ exercise?: string; language?: string }>(join(problemDir, "problem.json"));
      if (!meta.exercise) {
        throw new Error(`Problem "${problemName}" is missing an "exercise" key.`);
      }
      const { language: runtime, ...payload } = await buildCodePayload(problemDir, meta.exercise, meta.language === "typescript");

      try {
        // `problem.json`'s `language` is the catalog label and must win: a
        // C#-themed problem can still be authored and answered in TypeScript.
        // Which sandbox runs it comes from the exercise files instead.
        return problemSeedSchema.parse({ ...meta, ...payload, runtime });
      } catch (error) {
        throw new Error(`Problem "${problemName}" failed validation: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  );

  return loaded.filter((problem): problem is ProblemSeed => problem !== null).sort((a, b) => a.order - b.order);
}
