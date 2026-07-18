import type { TestCase } from "@content/_authoring/types";

export const functionName = "titleCase";

export const tests: TestCase[] = [
  { name: "capitalizes each word", args: ["hello world"], expected: "Hello World" },
  { name: "handles a longer sentence", args: ["the lazy brown dog"], expected: "The Lazy Brown Dog" },
  { name: "capitalizes a single word", args: ["forge"], expected: "Forge", hidden: true },
];
