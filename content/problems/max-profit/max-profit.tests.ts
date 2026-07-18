import type { TestCase } from "@content/_authoring/types";

export const functionName = "maxProfit";

export const tests: TestCase[] = [
  { name: "finds the best later sale", args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
  { name: "returns 0 for decreasing prices", args: [[9, 7, 4, 1]], expected: 0 },
  { name: "handles one price", args: [[5]], expected: 0, hidden: true },
];
