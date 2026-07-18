import type { TestCase } from "@content/_authoring/types";

export const functionName = "chunk";

export const tests: TestCase[] = [
  { name: "splits with a remainder", args: [[1, 2, 3, 4, 5], 2], expected: [[1, 2], [3, 4], [5]] },
  { name: "splits evenly", args: [[1, 2, 3, 4], 2], expected: [[1, 2], [3, 4]] },
  { name: "handles size larger than the array", args: [[1, 2], 5], expected: [[1, 2]], hidden: true },
];
