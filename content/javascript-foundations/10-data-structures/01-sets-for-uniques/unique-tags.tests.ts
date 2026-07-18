import type { TestCase } from "@content/_authoring/types";

export const functionName = "uniqueTags";

export const tests: TestCase[] = [
  { name: "removes duplicate tags", args: [["js", "arrays", "js", "sets"]], expected: ["js", "arrays", "sets"] },
  { name: "keeps first-seen order", args: [["b", "a", "b", "c", "a"]], expected: ["b", "a", "c"] },
  { name: "handles an empty list", args: [[]], expected: [], hidden: true },
];
