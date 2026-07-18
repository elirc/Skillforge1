import type { TestCase } from "@content/_authoring/types";

export const functionName = "countVowels";

export const tests: TestCase[] = [
  { name: "counts vowels in forge", args: ["forge"], expected: 2 },
  { name: "counts no vowels", args: ["rhythm"], expected: 0 },
  { name: "counts every vowel", args: ["education"], expected: 5, hidden: true },
];
