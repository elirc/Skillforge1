import type { TestCase } from "@content/_authoring/types";

export const functionName = "metGoal";

export const tests: TestCase[] = [
  { name: "meets goal exactly", args: [50, 50], expected: true },
  { name: "falls short", args: [49, 50], expected: false },
  { name: "exceeds the goal", args: [120, 50], expected: true, hidden: true },
];
