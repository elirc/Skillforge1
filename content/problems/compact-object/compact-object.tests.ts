import type { TestCase } from "@content/_authoring/types";

export const functionName = "compactObject";

export const tests: TestCase[] = [
  { name: "removes empty values", args: [{ name: "Ada", title: "", score: null }], expected: { name: "Ada" } },
  { name: "keeps false and zero", args: [{ active: false, count: 0, note: undefined }], expected: { active: false, count: 0 } },
  { name: "handles already compact objects", args: [{ a: 1, b: "x" }], expected: { a: 1, b: "x" }, hidden: true },
];
