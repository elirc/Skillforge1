import type { TestCase } from "@content/_authoring/types";

export const functionName = "lessonLabel";

export const tests: TestCase[] = [
  { name: "labels variables", args: ["Variables"], expected: "Lesson: Variables" },
  { name: "labels Arrays", args: ["Arrays"], expected: "Lesson: Arrays", hidden: true },
];
