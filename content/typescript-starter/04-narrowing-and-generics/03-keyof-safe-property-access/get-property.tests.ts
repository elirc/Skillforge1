import type { TestCase } from "@content/_authoring/types";

export const functionName = "getProperty";

export const tests: TestCase[] = [
  { name: "reads a string property", args: [{ id: "u1", name: "Ada" }, "name"], expected: "Ada" },
  { name: "reads a number property", args: [{ count: 3, done: false }, "count"], expected: 3 },
];
