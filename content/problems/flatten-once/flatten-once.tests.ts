import type { TestCase } from "@content/_authoring/types";

export const functionName = "flattenOnce";

export const tests: TestCase[] = [
  { name: "merges several rows", args: [[[1, 2], [3], [4, 5]]], expected: [1, 2, 3, 4, 5] },
  { name: "handles empty inner arrays", args: [[[], [1], []]], expected: [1] },
  { name: "handles an empty outer array", args: [[]], expected: [], hidden: true },
];
