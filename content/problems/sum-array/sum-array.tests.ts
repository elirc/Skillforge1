import type { TestCase } from "@content/_authoring/types";

export const functionName = "sumArray";

export const tests: TestCase[] = [
  { name: "sums a small list", args: [[1, 2, 3]], expected: 6 },
  { name: "sums to zero for an empty list", args: [[]], expected: 0 },
  { name: "handles negatives", args: [[10, -4, 2]], expected: 8, hidden: true },
];
