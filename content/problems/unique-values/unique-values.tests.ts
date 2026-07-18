import type { TestCase } from "@content/_authoring/types";

export const functionName = "uniqueValues";

export const tests: TestCase[] = [
  { name: "removes duplicates", args: [[1, 2, 2, 3, 1]], expected: [1, 2, 3] },
  { name: "keeps an already-unique list", args: [[4, 5, 6]], expected: [4, 5, 6] },
  { name: "handles an empty list", args: [[]], expected: [], hidden: true },
];
