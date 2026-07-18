import type { TestCase } from "@content/_authoring/types";

export const functionName = "missingNumber";

export const tests: TestCase[] = [
  { name: "finds a middle missing value", args: [[3, 0, 1]], expected: 2 },
  { name: "finds missing zero", args: [[1, 2, 3]], expected: 0 },
  { name: "finds missing n", args: [[0, 1]], expected: 2, hidden: true },
];
