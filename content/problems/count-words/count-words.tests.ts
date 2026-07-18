import type { TestCase } from "@content/_authoring/types";

export const functionName = "countWords";

export const tests: TestCase[] = [
  { name: "counts simple words", args: ["the quick brown fox"], expected: 4 },
  { name: "ignores extra spaces", args: ["  hello   world "], expected: 2 },
  { name: "counts an empty string as zero", args: [""], expected: 0 },
  { name: "counts a single word", args: ["solo"], expected: 1, hidden: true },
];
