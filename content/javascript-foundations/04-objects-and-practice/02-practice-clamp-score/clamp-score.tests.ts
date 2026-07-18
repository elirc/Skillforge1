import type { TestCase } from "@content/_authoring/types";

export const functionName = "clampScore";

export const tests: TestCase[] = [
  { name: "leaves an in-range score alone", args: [50], expected: 50 },
  { name: "caps an over-max score", args: [120], expected: 100 },
  { name: "raises a negative score to zero", args: [-5], expected: 0, hidden: true },
];
