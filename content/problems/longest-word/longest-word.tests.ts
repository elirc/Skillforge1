import type { TestCase } from "@content/_authoring/types";

export const functionName = "longestWord";

export const tests: TestCase[] = [
  { name: "finds the longest word", args: ["Build small reliable helpers"], expected: "reliable" },
  { name: "ignores punctuation", args: ["Wait... observability wins!"], expected: "observability" },
  { name: "keeps the first tie", args: ["alpha bravo"], expected: "alpha", hidden: true },
];
