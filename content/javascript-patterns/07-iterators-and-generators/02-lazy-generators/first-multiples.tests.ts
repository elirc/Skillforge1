import type { TestCase } from "@content/_authoring/types";

export const functionName = "firstMultiples";

export const tests: TestCase[] = [
  { name: "first three multiples of 5", args: [3, 5], expected: [5, 10, 15] },
  { name: "divisor 1 gives the naturals", args: [4, 1], expected: [1, 2, 3, 4] },
  { name: "first multiple of 7", args: [1, 7], expected: [7] },
  { name: "count 0 takes nothing (and still terminates)", args: [0, 3], expected: [], hidden: true },
];
