import type { TestCase } from "@content/_authoring/types";

export const functionName = "leaderboard";

export const tests: TestCase[] = [
  {
    name: "sorts by xp, highest first",
    args: [
      [
        { name: "Ada", xp: 120, streak: 3 },
        { name: "Grace", xp: 300, streak: 1 },
      ],
    ],
    expected: [
      { rank: 1, name: "Grace", xp: 300 },
      { rank: 2, name: "Ada", xp: 120 },
    ],
  },
  {
    name: "breaks ties by name",
    args: [
      [
        { name: "Linus", xp: 50, streak: 0 },
        { name: "Alan", xp: 50, streak: 9 },
      ],
    ],
    expected: [
      { rank: 1, name: "Alan", xp: 50 },
      { rank: 2, name: "Linus", xp: 50 },
    ],
  },
  { name: "empty list", args: [[]], expected: [] },
  {
    name: "drops streak from the output rows",
    args: [[{ name: "Ada", xp: 10, streak: 99 }]],
    expected: [{ rank: 1, name: "Ada", xp: 10 }],
    hidden: true,
  },
];
