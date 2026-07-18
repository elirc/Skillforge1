import "server-only";

import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import ts from "typescript";
import { problemSeedSchema, type ProblemSeed } from "@/lib/content-schema";

const PROBLEMS_DIR = join(process.cwd(), "content", "problems");

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function listProblemDirs(): Promise<string[]> {
  const entries = await readdir(PROBLEMS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function stripExports(source: string): string {
  return source
    .replace(/^\s*export\s+\{[^}]*\};?\s*$/gm, "")
    .replace(/^(\s*)export\s+default\s+/gm, "$1")
    .replace(/^(\s*)export\s+(?=(async\s+)?(function|const|let|var|class)\b)/gm, "$1");
}

function transpileToSandbox(source: string): string {
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
  return `${stripExports(output).trim()}\n`;
}

function evaluateTestsModule(source: string) {
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText;
  const exports: { functionName?: string; tests?: unknown } = {};
  new Function("exports", "require", output)(exports, () => ({}));
  return exports;
}

export type ProblemSummary = Pick<ProblemSeed, "slug" | "title" | "prompt" | "explanation" | "language" | "difficulty" | "conceptTags" | "order">;

async function loadProblemSummary(problemName: string): Promise<ProblemSummary | null> {
  const problemDir = join(PROBLEMS_DIR, problemName);
  const metaPath = join(problemDir, "problem.json");
  if (!(await exists(metaPath))) return null;

  return problemSeedSchema
    .pick({
      slug: true,
      title: true,
      prompt: true,
      explanation: true,
      language: true,
      difficulty: true,
      conceptTags: true,
      order: true,
    })
    .parse(JSON.parse(await readFile(metaPath, "utf8")));
}

export async function loadRuntimeProblemBySlug(slug: string): Promise<ProblemSeed | null> {
  const problemDir = join(PROBLEMS_DIR, slug);
  const metaPath = join(problemDir, "problem.json");
  if (!(await exists(metaPath))) return null;

  const meta = JSON.parse(await readFile(metaPath, "utf8")) as { exercise?: string };
  if (!meta.exercise) {
    throw new Error(`Problem "${slug}" is missing an "exercise" key.`);
  }

  const [starterSrc, solutionSrc, testsSrc] = await Promise.all([
    readFile(join(problemDir, `${meta.exercise}.starter.ts`), "utf8"),
    readFile(join(problemDir, `${meta.exercise}.solution.ts`), "utf8"),
    readFile(join(problemDir, `${meta.exercise}.tests.ts`), "utf8"),
  ]);
  const testsModule = evaluateTestsModule(testsSrc);

  return problemSeedSchema.parse({
    ...meta,
    starterCode: transpileToSandbox(starterSrc),
    referenceSolution: transpileToSandbox(solutionSrc),
    functionName: testsModule.functionName,
    tests: testsModule.tests,
  });
}

export async function loadRuntimeProblems(): Promise<ProblemSeed[]> {
  if (!(await exists(PROBLEMS_DIR))) return [];

  const problems = [];
  for (const problemName of await listProblemDirs()) {
    const problem = await loadRuntimeProblemBySlug(problemName);
    if (problem) problems.push(problem);
  }

  return problems.sort((a, b) => a.order - b.order);
}

export async function loadRuntimeProblemSummaries(): Promise<ProblemSummary[]> {
  if (!(await exists(PROBLEMS_DIR))) return [];

  const problems = [];
  for (const problemName of await listProblemDirs()) {
    const problem = await loadProblemSummary(problemName);
    if (problem) problems.push(problem);
  }

  return problems.sort((a, b) => a.order - b.order);
}
