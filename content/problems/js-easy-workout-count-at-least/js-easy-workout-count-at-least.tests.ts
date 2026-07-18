import type { TestCase } from "@content/_authoring/types";

export const functionName = "workoutCountAtLeast";

export const tests: TestCase[] = [
  {
    "name": "counts values at or above minimum",
    "args": [
      [
        5,
        10,
        12,
        0
      ],
      8
    ],
    "expected": 2
  },
  {
    "name": "returns zero when none qualify",
    "args": [
      [
        -1,
        0
      ],
      8
    ],
    "expected": 0
  },
  {
    "name": "counts values equal to minimum",
    "args": [
      [
        8,
        7,
        9
      ],
      8
    ],
    "expected": 2,
    "hidden": true
  }
];
