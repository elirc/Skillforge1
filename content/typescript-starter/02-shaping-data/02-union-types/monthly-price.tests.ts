import type { TestCase } from "@content/_authoring/types";

export const functionName = "monthlyPrice";

export const tests: TestCase[] = [
  { name: "free is always 0", args: ["free", 25], expected: 0 },
  { name: "pro charges 12 per seat", args: ["pro", 2], expected: 24 },
  { name: "team charges 8 per seat", args: ["team", 5], expected: 40 },
  { name: "team bills at least 3 seats", args: ["team", 1], expected: 24 },
  { name: "pro with one seat", args: ["pro", 1], expected: 12, hidden: true },
  { name: "team with exactly 3 seats", args: ["team", 3], expected: 24, hidden: true },
];
