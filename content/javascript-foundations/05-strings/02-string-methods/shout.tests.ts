import type { TestCase } from "@content/_authoring/types";

export const functionName = "shout";

export const tests: TestCase[] = [
  { name: "trims and upper-cases", args: ["  forge "], expected: "FORGE" },
  { name: "leaves clean text upper-cased", args: ["review"], expected: "REVIEW", hidden: true },
];
