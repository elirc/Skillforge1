import type { TestCase } from "@content/_authoring/types";

export const functionName = "doubleXp";

export const tests: TestCase[] = [
  { name: "doubles a list", args: [[5, 10, 15]], expected: [10, 20, 30] },
  { name: "handles empty list", args: [[]], expected: [], hidden: true },
];
