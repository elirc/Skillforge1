import type { TestCase } from "@content/_authoring/types";

export const functionName = "shortestPath";

const maze = ["S....", "####.", ".....", ".####", "....E"];

export const tests: TestCase[] = [
  { name: "a clear corridor", args: [["S.E"], 0], expected: 2 },
  { name: "a pallet blocks the only route", args: [["S#E"], 0], expected: -1 },
  { name: "one pallet can be pushed through", args: [["S#E"], 1], expected: 2 },
  { name: "detour when no pallets may be moved", args: [["S#E", "..."], 0], expected: 4 },
  { name: "push through when it is shorter", args: [["S#E", "..."], 1], expected: 2 },
  { name: "a dead end becomes reachable with one push", args: [["S.#.", "##..", "...E"], 1], expected: 5 },
  { name: "two pallets in a row need two pushes", args: [["S##E"], 1], expected: -1 },
  { name: "a long snake path without pushes", args: [maze, 0], expected: 16 },
  { name: "one push cuts the snake in half", args: [maze, 1], expected: 8, hidden: true },
  { name: "unused budget changes nothing", args: [["S.E"], 5], expected: 2, hidden: true },
  { name: "the same dead end without pushes", args: [["S.#.", "##..", "...E"], 0], expected: -1, hidden: true },
];
