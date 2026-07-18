import type { TestCase } from "@content/_authoring/types";

export const functionName = "sumDigits";

export const tests: TestCase[] = [
  { name: "sums digits of 123", args: [123], expected: 6 },
  { name: "sums digits of 99", args: [99], expected: 18 },
  { name: "returns 0 for 0", args: [0], expected: 0, hidden: true },
];
