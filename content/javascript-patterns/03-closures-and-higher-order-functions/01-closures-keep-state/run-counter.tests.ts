import type { TestCase } from "@content/_authoring/types";

export const functionName = "runCounter";

export const tests: TestCase[] = [
  { name: "increments remember the previous value", args: [0, ["inc", "inc", "inc"]], expected: [1, 2, 3] },
  { name: "mixes increment and decrement", args: [10, ["inc", "dec", "dec"]], expected: [11, 10, 9] },
  { name: "reset returns to the starting value", args: [5, ["inc", "inc", "reset", "dec"]], expected: [6, 7, 5, 4] },
  { name: "no ops gives no values", args: [3, []], expected: [], hidden: true },
  { name: "can go negative", args: [0, ["dec", "dec"]], expected: [-1, -2], hidden: true },
];
