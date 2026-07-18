import type { TestCase } from "@content/_authoring/types";

export const functionName = "latencyCountAtLeast";

export const tests: TestCase[] = [
  {
    "name": "counts values at or above minimum",
    "args": [
      [
        120,
        80,
        250,
        40
      ],
      100
    ],
    "expected": 2
  },
  {
    "name": "returns zero when none qualify",
    "args": [
      [
        48,
        49
      ],
      100
    ],
    "expected": 0
  },
  {
    "name": "counts values equal to minimum",
    "args": [
      [
        100,
        99,
        101
      ],
      100
    ],
    "expected": 2,
    "hidden": true
  }
];
