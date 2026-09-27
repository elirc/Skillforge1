import type { TestCase } from "@content/_authoring/types";

export const functionName = "cheapestToQualify";

export const tests: TestCase[] = [
  { name: "picks the first price above the gap", args: [[3, 5, 8, 12, 20], 40, 50], expected: 12 },
  { name: "an exact match counts", args: [[3, 5, 8, 12, 20], 42, 50], expected: 8 },
  { name: "null when no item is enough", args: [[3, 5], 10, 50], expected: null },
  { name: "0 when the cart already qualifies", args: [[1, 2], 60, 50], expected: 0 },
  { name: "an empty catalogue", args: [[], 49, 50], expected: null },
  { name: "skips a block of duplicates that are too small", args: [[4, 4, 4, 9], 45, 50], expected: 9 },
  { name: "a single item that is just enough", args: [[10], 40, 50], expected: 10, hidden: true },
  { name: "the gap is the whole threshold", args: [[2, 3, 5, 7, 11, 13, 17], 0, 13], expected: 13, hidden: true },
];
