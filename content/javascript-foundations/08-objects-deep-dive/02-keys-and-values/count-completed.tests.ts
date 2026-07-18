import type { TestCase } from "@content/_authoring/types";

export const functionName = "countCompleted";

export const tests: TestCase[] = [
  { name: "counts completed lessons", args: [{ intro: true, arrays: false, loops: true }], expected: 2 },
  { name: "handles an empty record", args: [{}], expected: 0 },
  { name: "counts none completed", args: [{ intro: false, arrays: false }], expected: 0, hidden: true },
];
