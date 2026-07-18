import type { TestCase } from "@content/_authoring/types";

export const functionName = "temperatureCountAtLeast";

export const tests: TestCase[] = [
  {
    "name": "counts values at or above minimum",
    "args": [
      [
        -3,
        0,
        8,
        15
      ],
      5
    ],
    "expected": 2
  },
  {
    "name": "returns zero when none qualify",
    "args": [
      [
        -12,
        -11
      ],
      5
    ],
    "expected": 0
  },
  {
    "name": "counts values equal to minimum",
    "args": [
      [
        5,
        4,
        6
      ],
      5
    ],
    "expected": 2,
    "hidden": true
  }
];
