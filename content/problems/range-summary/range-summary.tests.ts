import type { TestCase } from "@content/_authoring/types";

export const functionName = "rangeSummary";

export const tests: TestCase[] = [
  { name: "summarizes mixed ranges", args: [[0, 1, 2, 4, 5, 7]], expected: ["0->2", "4->5", "7"] },
  { name: "handles singletons", args: [[3, 5, 9]], expected: ["3", "5", "9"] },
  { name: "handles empty input", args: [[]], expected: [], hidden: true },
];
