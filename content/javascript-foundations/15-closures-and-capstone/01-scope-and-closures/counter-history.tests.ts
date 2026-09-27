import type { TestCase } from "@content/_authoring/types";

export const functionName = "counterHistory";

export const tests: TestCase[] = [
  { name: "the count is remembered between calls", args: [0, ["inc", "inc", "inc"]], expected: [1, 2, 3] },
  { name: "starts from the given number", args: [10, ["inc", "dec", "dec"]], expected: [11, 10, 9] },
  { name: "reset goes back to the start value", args: [5, ["inc", "inc", "reset", "inc"]], expected: [6, 7, 5, 6] },
  { name: "the count can go below zero", args: [0, ["dec", "dec"]], expected: [-1, -2] },
  { name: "unknown actions record the current value", args: [2, ["inc", "jump", "inc"]], expected: [3, 3, 4] },
  { name: "no actions, no history", args: [0, []], expected: [] },
  { name: "a long run keeps counting", args: [0, ["inc", "inc", "inc", "inc", "dec", "inc"]], expected: [1, 2, 3, 4, 3, 4], hidden: true },
];
