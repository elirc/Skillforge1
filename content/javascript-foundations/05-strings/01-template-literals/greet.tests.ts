import type { TestCase } from "@content/_authoring/types";

export const functionName = "greet";

export const tests: TestCase[] = [
  { name: "greets Ada", args: ["Ada"], expected: "Hello, Ada!" },
  { name: "greets Lin", args: ["Lin"], expected: "Hello, Lin!", hidden: true },
];
