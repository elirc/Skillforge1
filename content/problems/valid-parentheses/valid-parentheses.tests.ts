import type { TestCase } from "@content/_authoring/types";

export const functionName = "validParentheses";

export const tests: TestCase[] = [
  { name: "accepts nested pairs", args: ["({[]})"], expected: true },
  { name: "rejects mismatched pairs", args: ["([)]"], expected: false },
  { name: "rejects unclosed brackets", args: ["(()"], expected: false, hidden: true },
];
