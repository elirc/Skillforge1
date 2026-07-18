import type { TestCase } from "@content/_authoring/types";

export const functionName = "double";

export const tests: TestCase[] = [
  { name: "doubles positive values", args: [4], expected: 8 },
  { name: "doubles negative values", args: [-3], expected: -6, hidden: true },
];
