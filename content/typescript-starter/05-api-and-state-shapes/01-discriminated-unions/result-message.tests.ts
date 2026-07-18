import type { TestCase } from "@content/_authoring/types";

export const functionName = "resultMessage";

export const tests: TestCase[] = [
  { name: "returns success value", args: [{ ok: true, value: "Saved" }], expected: "Saved" },
  { name: "formats error value", args: [{ ok: false, error: "Missing title" }], expected: "Error: Missing title" },
];
