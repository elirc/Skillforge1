import type { TestCase } from "@content/_authoring/types";

export const functionName = "workoutHasTarget";

export const tests: TestCase[] = [
  {
    "name": "finds present targets",
    "args": [
      [
        5,
        10,
        12,
        0
      ],
      10
    ],
    "expected": true
  },
  {
    "name": "rejects missing targets",
    "args": [
      [
        5,
        10,
        12,
        0
      ],
      9999
    ],
    "expected": false
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      5
    ],
    "expected": false,
    "hidden": true
  }
];
