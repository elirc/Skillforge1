import type { TestCase } from "@content/_authoring/types";

export const functionName = "reverseWords";

export const tests: TestCase[] = [
  { name: "reverses two words", args: ["hello world"], expected: "world hello" },
  { name: "reverses several words", args: ["the quick brown fox"], expected: "fox brown quick the" },
  { name: "leaves one word alone", args: ["solo"], expected: "solo", hidden: true },
];
