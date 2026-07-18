import type { TestCase } from "@content/_authoring/types";

export const functionName = "cleanTags";

export const tests: TestCase[] = [
  { name: "cleans and keeps meaningful tags", args: [[" JS ", "", "Arrays", "  "]], expected: ["js", "arrays"] },
  { name: "returns empty when every tag cleans to empty", args: [[" ", ""]], expected: [], hidden: true },
];
