import type { TestCase } from "@content/_authoring/types";

export const functionName = "rotateArray";

export const tests: TestCase[] = [
  { name: "rotates by two", args: [[1, 2, 3, 4, 5], 2], expected: [4, 5, 1, 2, 3] },
  { name: "wraps large k", args: [[1, 2, 3], 4], expected: [3, 1, 2] },
  { name: "handles empty arrays", args: [[], 3], expected: [], hidden: true },
];
