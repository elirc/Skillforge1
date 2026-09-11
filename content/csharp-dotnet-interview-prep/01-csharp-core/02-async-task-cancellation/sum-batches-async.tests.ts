import type { TestCase } from "@content/_authoring/types";

export const functionName = "SumBatchesAsync";

// The harness awaits a returned Task<T> and compares the unwrapped value.
export const tests: TestCase[] = [
  { name: "sums two batches", args: [[[1, 2], [3, 4]]], expected: 10 },
  { name: "handles a single batch", args: [[[5]]], expected: 5 },
  { name: "handles no batches at all", args: [[]], expected: 0 },
  { name: "sums many single-item batches", args: [[[1], [2], [3]]], expected: 6, hidden: true },
  { name: "handles an empty batch among full ones", args: [[[2], [], [3]]], expected: 5, hidden: true },
];
