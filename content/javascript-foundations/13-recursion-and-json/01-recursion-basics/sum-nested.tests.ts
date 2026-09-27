import type { TestCase } from "@content/_authoring/types";

export const functionName = "sumNested";

export const tests: TestCase[] = [
  { name: "a flat list", args: [[1, 2, 3]], expected: 6 },
  { name: "one level of nesting", args: [[1, [2, 3], 4]], expected: 10 },
  { name: "deep nesting", args: [[1, [2, [3, [4, [5]]]]]], expected: 15 },
  { name: "an empty list adds up to 0", args: [[]], expected: 0 },
  { name: "empty inner lists add nothing", args: [[[], [[]], 7]], expected: 7 },
  { name: "negative numbers count too", args: [[10, [-3, [-2]]]], expected: 5 },
  { name: "only nested lists", args: [[[1], [2], [3, [4]]]], expected: 10, hidden: true },
];
