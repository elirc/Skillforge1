import type { TestCase } from "@content/_authoring/types";

export const functionName = "passingReadonly";

export const tests: TestCase[] = [
  { name: "keeps passing scores", args: [[68, 70, 91]], expected: [70, 91] },
  { name: "returns empty when none pass", args: [[20, 69]], expected: [], hidden: true },
];
