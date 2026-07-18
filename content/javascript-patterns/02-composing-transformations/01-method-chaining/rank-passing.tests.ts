import type { TestCase } from "@content/_authoring/types";

export const functionName = "rankPassing";

export const tests: TestCase[] = [
  { name: "filters then sorts", args: [[70, 95, 80, 60, 88]], expected: [95, 88, 80] },
  { name: "returns empty when none pass", args: [[10, 20]], expected: [] },
  { name: "keeps ties", args: [[80, 80]], expected: [80, 80], hidden: true },
];
