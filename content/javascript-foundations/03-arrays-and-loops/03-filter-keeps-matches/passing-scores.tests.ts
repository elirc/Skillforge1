import type { TestCase } from "@content/_authoring/types";

export const functionName = "passingScores";

export const tests: TestCase[] = [
  { name: "keeps passing scores", args: [[75, 80, 92]], expected: [80, 92] },
  { name: "handles no passing scores", args: [[1, 2]], expected: [], hidden: true },
];
