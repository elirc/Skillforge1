import type { TestCase } from "@content/_authoring/types";

export const functionName = "longestIncreasingRun";

export const tests: TestCase[] = [
  {
    "name": "finds an increasing run",
    "args": [
      [
        1,
        2,
        3,
        1,
        2
      ]
    ],
    "expected": 3
  },
  {
    "name": "returns zero for empty arrays",
    "args": [
      []
    ],
    "expected": 0
  },
  {
    "name": "resets on equal values",
    "args": [
      [
        2,
        2,
        3,
        4
      ]
    ],
    "expected": 3,
    "hidden": true
  }
];
