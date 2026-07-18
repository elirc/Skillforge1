import type { TestCase } from "@content/_authoring/types";

export const functionName = "formatId";

export const tests: TestCase[] = [
  { name: "formats a number id", args: [42], expected: "#42" },
  { name: "formats a string id", args: [" abc "], expected: "ABC" },
  { name: "handles zero", args: [0], expected: "#0", hidden: true },
];
