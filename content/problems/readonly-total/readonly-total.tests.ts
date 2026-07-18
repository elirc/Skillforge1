import type { TestCase } from "@content/_authoring/types";

export const functionName = "readonlyTotal";

export const tests: TestCase[] = [
  {
    "name": "sums readonly values",
    "args": [
      [
        1,
        2,
        3
      ]
    ],
    "expected": 6
  },
  {
    "name": "handles empty values",
    "args": [
      []
    ],
    "expected": 0
  },
  {
    "name": "handles negatives",
    "args": [
      [
        5,
        -2
      ]
    ],
    "expected": 3,
    "hidden": true
  }
];
