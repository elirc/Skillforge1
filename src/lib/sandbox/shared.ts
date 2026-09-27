import { z } from "zod";

export const sandboxTestSchema = z.object({
  name: z.string(),
  args: z.array(z.unknown()),
  expected: z.unknown(),
  hidden: z.boolean().default(false),
});

/**
 * Which runtime grades an exercise. Anything JavaScript-shaped (including the
 * React problems) runs in the browser worker; C# needs the .NET host behind an
 * API route, because it cannot run in the browser at all.
 */
export const sandboxLanguageSchema = z.enum(["javascript", "typescript", "csharp", "sql", "react"]);
export type SandboxLanguage = z.infer<typeof sandboxLanguageSchema>;

export function runtimeForLanguage(language: string | null | undefined): SandboxLanguage {
  return sandboxLanguageSchema.catch("javascript").parse(language);
}

export interface CompileDiagnostic {
  id: string;
  message: string;
  line: number;
  column: number;
}

/** A submission that never ran: it did not compile. Not the same as a failing test. */
export class SandboxCompileError extends Error {
  constructor(readonly diagnostics: CompileDiagnostic[]) {
    super("The submission did not compile.");
    this.name = "SandboxCompileError";
  }
}

export const regressionSchema = z.object({ factoryName: z.string(), referenceCode: z.string(), mutants: z.array(z.string()).min(1) });
export const sandboxRequestSchema = z.object({
  code: z.string(),
  functionName: z.string(),
  tests: z.array(sandboxTestSchema),
  regression: regressionSchema.optional(),
  typeChecks: z.string().optional(),
});

export type SandboxTest = z.infer<typeof sandboxTestSchema>;
export type SandboxRequest = z.infer<typeof sandboxRequestSchema>;

export interface SandboxResult {
  name: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  error: string | null;
  hidden: boolean;
}

export interface SandboxResponse {
  results: SandboxResult[];
  passed: boolean;
  stdout?: string;
}

export function successfulTypeCheck(): SandboxResponse {
  return { passed: true, results: [{ name: "Compile-time contract", passed: true, expected: "No TypeScript errors", actual: "No TypeScript errors", hidden: false, error: null }] };
}

export function buildHarnessSource(request: SandboxRequest) {
  const serialized = JSON.stringify(request);
  return `
(async () => {
const request = ${serialized};
const disabled = () => { throw new Error("Network and worker escape APIs are disabled in Skillforge exercises."); };
globalThis.fetch = disabled;
globalThis.XMLHttpRequest = undefined;
globalThis.WebSocket = undefined;
globalThis.importScripts = disabled;

const logs = [];
const log = (...values) => {
  if (logs.length < 100) logs.push(values.map(value => {
    try { return typeof value === "string" ? value : JSON.stringify(value); }
    catch { return String(value); }
  }).join(" ").slice(0, 2000));
};
const originalConsole = globalThis.console;
globalThis.console = { ...originalConsole, log, info: log, warn: log, error: log, debug: log };

function sameValue(actual, expected) {
  if (Object.is(actual, expected)) return true;
  if (actual === null || expected === null || typeof actual !== "object" || typeof expected !== "object") return false;
  if (Array.isArray(actual) !== Array.isArray(expected)) return false;
  const keys = Object.keys(actual).sort();
  const otherKeys = Object.keys(expected).sort();
  return keys.length === otherKeys.length && keys.every((key, index) => key === otherKeys[index] && sameValue(actual[key], expected[key]));
}

async function run() {
  const userFactory = new Function('"use strict";\\n' + request.code + '\\n; return ' + request.functionName + ';');
  const userFunction = userFactory();
  if (typeof userFunction !== "function") {
    throw new Error("Expected " + request.functionName + " to be a function.");
  }
  const results = [];
  for (const test of request.tests) {
    try {
      const actual = await userFunction(...structuredClone(test.args));
      const passed = sameValue(actual, test.expected);
      results.push({ name: test.name, passed, expected: test.expected, actual, error: null, hidden: test.hidden });
    } catch (error) {
      results.push({
        name: test.name,
        passed: false,
        expected: test.expected,
        actual: null,
        error: error instanceof Error ? error.message : String(error),
        hidden: test.hidden,
      });
    }
  }
  if (request.regression) {
    let error = null;
    try {
      const casesFactory = new Function(request.code + '\\nreturn ' + request.regression.factoryName + ';')();
      const cases = casesFactory();
      if (!Array.isArray(cases) || cases.length === 0 || cases.length > 30) throw new Error('Add 1 to 30 regression cases with args and expected values.');
      const check = async (code, mustPass) => {
        const fn = new Function(code + '\\nreturn ' + request.functionName + ';')();
        let allPassed = true;
        for (const test of cases) {
          if (!test || !Array.isArray(test.args) || !Object.hasOwn(test, 'expected')) throw new Error('Each regression case needs args and expected.');
          try { if (!sameValue(await fn(...structuredClone(test.args)), test.expected)) allPassed = false; }
          catch { allPassed = false; }
        }
        return mustPass ? allPassed : !allPassed;
      };
      if (!await check(request.regression.referenceCode, true)) throw new Error('A regression expectation disagrees with the documented contract.');
      for (const mutant of request.regression.mutants) if (!await check(mutant, false)) throw new Error('Your regression cases do not catch the original bug. Add a boundary case that fails before the fix.');
    } catch (failure) { error = failure instanceof Error ? failure.message : String(failure); }
    results.push({ name: 'Regression tests catch the original bug', passed: !error, expected: true, actual: !error, error, hidden: false });
  }
  return { results, passed: results.every((result) => result.passed), stdout: logs.join('\\n') };
}

try { return await run(); } finally { globalThis.console = originalConsole; }
})()
`;
}
