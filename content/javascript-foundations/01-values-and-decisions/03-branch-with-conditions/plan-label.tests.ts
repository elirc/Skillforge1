import type { TestCase } from "@content/_authoring/types";

export const functionName = "planLabel";

export const tests: TestCase[] = [
  { name: "pro account", args: [true], expected: "pro" },
  { name: "core account", args: [false], expected: "core" },
];
