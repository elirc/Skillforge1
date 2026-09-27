import type { TestCase } from "@content/_authoring/types";

export const functionName = "memoStats";

export const tests: TestCase[] = [
  { name: "repeated inputs hit the cache", args: [[3, 3, 3]], expected: { results: [9, 9, 9], calls: 1 } },
  { name: "each distinct input is computed once", args: [[2, 4, 2, 4, 5]], expected: { results: [4, 16, 4, 16, 25], calls: 3 } },
  { name: "unique inputs are all computed", args: [[1, 2, 3]], expected: { results: [1, 4, 9], calls: 3 } },
  { name: "zero is cached too", args: [[0, 0]], expected: { results: [0, 0], calls: 1 }, hidden: true },
  { name: "no inputs, no calls", args: [[]], expected: { results: [], calls: 0 }, hidden: true },
];
