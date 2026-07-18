import type { TestCase } from "@content/_authoring/types";

export const functionName = "topScores";

export const tests: TestCase[] = [
  { name: "sorts descending", args: [[12, 90, 45]], expected: [90, 45, 12] },
  { name: "sorts numbers numerically", args: [[100, 9, 20]], expected: [100, 20, 9], hidden: true },
];
