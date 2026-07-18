import type { TestCase } from "@content/_authoring/types";

export const functionName = "maxScore";

export const tests: TestCase[] = [
  { name: "finds the highest score", args: [[3, 9, 2]], expected: 9 },
  { name: "handles a single score", args: [[5]], expected: 5 },
  { name: "works with all negatives", args: [[-1, -7, -3]], expected: -1, hidden: true },
];
