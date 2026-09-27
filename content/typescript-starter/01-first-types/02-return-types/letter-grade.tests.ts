import type { TestCase } from "@content/_authoring/types";

export const functionName = "letterGrade";

export const tests: TestCase[] = [
  { name: "95 is an A", args: [95], expected: "A" },
  { name: "exactly 90 is an A", args: [90], expected: "A" },
  { name: "89 is a B", args: [89], expected: "B" },
  { name: "72 is a C", args: [72], expected: "C" },
  { name: "60 is a D", args: [60], expected: "D" },
  { name: "0 is an F", args: [0], expected: "F" },
  { name: "above 100 is invalid", args: [101], expected: "invalid", hidden: true },
  { name: "negative is invalid", args: [-1], expected: "invalid", hidden: true },
];
