import type { TestCase } from "@content/_authoring/types";

export const functionName = "safeAverage";

export const tests: TestCase[] = [
  { name: "averages three scores", args: [[10, 20, 30]], expected: 20 },
  { name: "guards the empty array", args: [[]], expected: 0 },
  { name: "averages a single score", args: [[5]], expected: 5, hidden: true },
];
