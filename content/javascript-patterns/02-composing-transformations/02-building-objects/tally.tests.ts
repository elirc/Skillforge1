import type { TestCase } from "@content/_authoring/types";

export const functionName = "tally";

export const tests: TestCase[] = [
  { name: "counts repeated words", args: [["a", "b", "a"]], expected: { a: 2, b: 1 } },
  { name: "handles an empty list", args: [[]], expected: {} },
  { name: "counts a single repeated word", args: [["x", "x", "x"]], expected: { x: 3 }, hidden: true },
];
