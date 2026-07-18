import type { TestCase } from "@content/_authoring/types";

export const functionName = "digitalRoot";

export const tests: TestCase[] = [
  { name: "reduces 942 to 6", args: [942], expected: 6 },
  { name: "reduces 99 to 9", args: [99], expected: 9 },
  { name: "leaves a single digit alone", args: [5], expected: 5 },
  { name: "returns 0 for 0", args: [0], expected: 0, hidden: true },
];
