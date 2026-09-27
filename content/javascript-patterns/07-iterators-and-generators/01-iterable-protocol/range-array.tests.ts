import type { TestCase } from "@content/_authoring/types";

export const functionName = "rangeArray";

export const tests: TestCase[] = [
  { name: "counts up by one", args: [0, 5, 1], expected: [0, 1, 2, 3, 4] },
  { name: "end is exclusive with larger steps", args: [1, 10, 3], expected: [1, 4, 7] },
  { name: "empty when start >= end", args: [5, 5, 1], expected: [] },
  { name: "a non-positive step yields nothing", args: [0, 3, 0], expected: [], hidden: true },
  { name: "negative numbers work", args: [-3, 1, 2], expected: [-3, -1], hidden: true },
];
