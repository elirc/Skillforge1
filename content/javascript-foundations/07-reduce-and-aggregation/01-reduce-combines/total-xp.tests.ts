import type { TestCase } from "@content/_authoring/types";

export const functionName = "totalXp";

export const tests: TestCase[] = [
  { name: "adds a list of rewards", args: [[10, 20, 5]], expected: 35 },
  { name: "returns 0 for an empty list", args: [[]], expected: 0, hidden: true },
];
