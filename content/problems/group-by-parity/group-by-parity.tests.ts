import type { TestCase } from "@content/_authoring/types";

export const functionName = "groupByParity";

export const tests: TestCase[] = [
  { name: "splits a mixed list", args: [[1, 2, 3, 4]], expected: { even: [2, 4], odd: [1, 3] } },
  { name: "handles all even", args: [[2, 4, 6]], expected: { even: [2, 4, 6], odd: [] } },
  { name: "handles an empty list", args: [[]], expected: { even: [], odd: [] }, hidden: true },
];
