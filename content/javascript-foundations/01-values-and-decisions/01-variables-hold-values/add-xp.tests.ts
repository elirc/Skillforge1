import type { TestCase } from "@content/_authoring/types";

export const functionName = "addXp";

export const tests: TestCase[] = [
  { name: "adds a small reward", args: [10, 5], expected: 15 },
  { name: "handles zero current XP", args: [0, 25], expected: 25, hidden: true },
];
