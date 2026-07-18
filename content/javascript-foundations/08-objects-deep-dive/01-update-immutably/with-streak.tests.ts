import type { TestCase } from "@content/_authoring/types";

export const functionName = "withStreak";

export const tests: TestCase[] = [
  { name: "updates the streak", args: [{ name: "Ada", streak: 1 }, 7], expected: { name: "Ada", streak: 7 } },
  { name: "keeps other keys", args: [{ name: "Lin", streak: 4 }, 0], expected: { name: "Lin", streak: 0 }, hidden: true },
];
