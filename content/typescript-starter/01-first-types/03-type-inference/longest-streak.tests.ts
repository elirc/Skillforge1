import type { TestCase } from "@content/_authoring/types";

export const functionName = "longestStreak";

export const tests: TestCase[] = [
  { name: "a single run", args: [[true, true, true]], expected: 3 },
  { name: "picks the longer of two runs", args: [[true, false, true, true, false]], expected: 2 },
  { name: "no practice days", args: [[false, false]], expected: 0 },
  { name: "empty history", args: [[]], expected: 0 },
  { name: "run at the very end counts", args: [[true, false, true, true, true]], expected: 3, hidden: true },
  { name: "resets on every missed day", args: [[true, false, true, false, true]], expected: 1, hidden: true },
];
