import type { TestCase } from "@content/_authoring/types";

export const functionName = "mergeIntervals";

export const tests: TestCase[] = [
  { name: "merges overlapping intervals", args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
  { name: "merges touching intervals", args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
  { name: "handles unsorted input", args: [[[5, 7], [1, 2], [2, 4]]], expected: [[1, 4], [5, 7]], hidden: true },
];
