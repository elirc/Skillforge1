import type { TestCase } from "@content/_authoring/types";

export const functionName = "firstOrFallback";

export const tests: TestCase[] = [
  { name: "returns first string", args: [["red", "blue"], "none"], expected: "red" },
  { name: "returns fallback for empty number list", args: [[], 99], expected: 99 },
  { name: "works for objects", args: [[{ id: 1 }], { id: 0 }], expected: { id: 1 }, hidden: true },
];
