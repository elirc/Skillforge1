import type { TestCase } from "@content/_authoring/types";

export const functionName = "sumTo";

export const tests: TestCase[] = [
  { name: "sums 1 through 5", args: [5], expected: 15 },
  { name: "sums a single number", args: [1], expected: 1 },
  { name: "returns 0 below 1", args: [0], expected: 0, hidden: true },
];
