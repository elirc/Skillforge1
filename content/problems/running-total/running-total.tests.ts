import type { TestCase } from "@content/_authoring/types";

export const functionName = "runningTotal";

export const tests: TestCase[] = [
  { name: "builds prefix totals", args: [[1, 2, 3, 4]], expected: [1, 3, 6, 10] },
  { name: "includes negative numbers", args: [[5, -2, 7]], expected: [5, 3, 10] },
  { name: "handles empty input", args: [[]], expected: [], hidden: true },
];
