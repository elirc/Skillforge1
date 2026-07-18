import type { TestCase } from "@content/_authoring/types";

export const functionName = "workoutScaleValues";

export const tests: TestCase[] = [
  {
    "name": "scales each value",
    "args": [
      [
        1,
        2,
        3
      ],
      4
    ],
    "expected": [
      4,
      8,
      12
    ]
  },
  {
    "name": "handles zero factor",
    "args": [
      [
        4,
        5
      ],
      0
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      [],
      4
    ],
    "expected": [],
    "hidden": true
  }
];
