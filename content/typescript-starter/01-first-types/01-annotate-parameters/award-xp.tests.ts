import type { TestCase } from "@content/_authoring/types";

export const functionName = "awardXp";

export const tests: TestCase[] = [
  { name: "no streak, not a review", args: [20, 0, false], expected: 20 },
  { name: "adds 5 XP per streak day", args: [20, 3, false], expected: 35 },
  { name: "caps the streak bonus at 10 days", args: [20, 40, false], expected: 70 },
  { name: "reviews earn half, rounded down", args: [21, 0, true], expected: 10 },
  { name: "halves the bonus too on a review", args: [10, 2, true], expected: 10, hidden: true },
  { name: "never goes below zero", args: [-30, 0, false], expected: 0, hidden: true },
];
