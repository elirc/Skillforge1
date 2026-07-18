import type { TestCase } from "@content/_authoring/types";

export const functionName = "getStreak";

export const tests: TestCase[] = [
  { name: "reads an active streak", args: [{ name: "Ada", streak: 5 }], expected: 5 },
  { name: "reads a zero streak", args: [{ name: "Lin", streak: 0 }], expected: 0, hidden: true },
];
