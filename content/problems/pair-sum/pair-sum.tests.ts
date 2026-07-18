import type { TestCase } from "@content/_authoring/types";

export const functionName = "pairSum";

export const tests: TestCase[] = [
  { name: "finds a matching pair", args: [[2, 7, 11], 9], expected: true },
  { name: "reports no pair", args: [[1, 2, 3], 7], expected: false },
  { name: "needs two separate positions", args: [[3, 3], 6], expected: true, hidden: true },
];
