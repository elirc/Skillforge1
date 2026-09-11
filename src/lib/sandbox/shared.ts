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
export const sandboxLanguageSchema = z.enum(["javascript", "csharp"]);
export type SandboxLanguage = z.infer<typeof sandboxLanguageSchema>;

export function runtimeForLanguage(language: string | null | undefined): SandboxLanguage {
  return language === "csharp" ? "csharp" : "javascript";
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

export const sandboxRequestSchema = z.object({
  code: z.string(),
  functionName: z.string(),
  tests: z.array(sandboxTestSchema),
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
}

export function buildHarnessSource(request: SandboxRequest) {
  const serialized = JSON.stringify(request);
  return `
(() => {
const request = ${serialized};
const disabled = () => { throw new Error("Network and worker escape APIs are disabled in Skillforge exercises."); };
globalThis.fetch = disabled;
globalThis.XMLHttpRequest = undefined;
globalThis.WebSocket = undefined;
globalThis.importScripts = disabled;

function sameValue(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function run() {
  const userFactory = new Function('"use strict";\\n' + request.code + '\\n; return ' + request.functionName + ';');
  const userFunction = userFactory();
  if (typeof userFunction !== "function") {
    throw new Error("Expected " + request.functionName + " to be a function.");
  }
  const results = request.tests.map((test) => {
    try {
      const actual = userFunction(...test.args);
      const passed = sameValue(actual, test.expected);
      return { name: test.name, passed, expected: test.expected, actual, error: null, hidden: test.hidden };
    } catch (error) {
      return {
        name: test.name,
        passed: false,
        expected: test.expected,
        actual: null,
        error: error instanceof Error ? error.message : String(error),
        hidden: test.hidden,
      };
    }
  });
  return { results, passed: results.every((result) => result.passed) };
}

return run();
})()
`;
}
