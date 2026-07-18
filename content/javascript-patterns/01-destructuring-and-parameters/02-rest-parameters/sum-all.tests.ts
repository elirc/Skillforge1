import type { TestCase } from "@content/_authoring/types";

export const functionName = "sumAll";

export const tests: TestCase[] = [
  { name: "adds several arguments", args: [1, 2, 3], expected: 6 },
  { name: "returns 0 with no arguments", args: [], expected: 0 },
  { name: "adds a single argument", args: [10], expected: 10, hidden: true },
];
