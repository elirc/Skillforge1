import type { TestCase } from "@content/_authoring/types";

export const functionName = "longestStreak";

const T = true;
const F = false;
const month = [T, T, F, T, T, T, F, F, T];

export const tests: TestCase[] = [
  { name: "one freeze bridges a single gap", args: [month, 1], expected: { length: 6, start: 0 } },
  { name: "no freezes means the longest all-true run", args: [month, 0], expected: { length: 3, start: 3 } },
  { name: "two freezes bridge two gaps", args: [month, 2], expected: { length: 7, start: 0 } },
  { name: "no practice and no freezes", args: [[F, F, F], 0], expected: { length: 0, start: 0 } },
  { name: "more freezes than misses covers everything", args: [[F, F, F], 5], expected: { length: 3, start: 0 } },
  { name: "an empty history", args: [[], 2], expected: { length: 0, start: 0 } },
  { name: "the best window can start later", args: [[T, F, T, F, T, T], 1], expected: { length: 4, start: 2 }, hidden: true },
  { name: "ties keep the earliest start", args: [[T, T, F, T, T], 0], expected: { length: 2, start: 0 }, hidden: true },
];
