import type { TestCase } from "@content/_authoring/types";

export const functionName = "averageRating";

export const tests: TestCase[] = [
  {
    "name": "averages ratings",
    "args": [
      [
        5,
        4,
        3
      ]
    ],
    "expected": 4
  },
  {
    "name": "returns zero for no ratings",
    "args": [
      []
    ],
    "expected": 0
  },
  {
    "name": "supports decimal averages",
    "args": [
      [
        5,
        4
      ]
    ],
    "expected": 4.5,
    "hidden": true
  }
];
