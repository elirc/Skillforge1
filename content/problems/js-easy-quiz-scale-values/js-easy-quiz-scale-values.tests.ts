import type { TestCase } from "@content/_authoring/types";

export const functionName = "quizScaleValues";

export const tests: TestCase[] = [
  {
    "name": "scales each value",
    "args": [
      [
        1,
        2,
        3
      ],
      2
    ],
    "expected": [
      2,
      4,
      6
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
      2
    ],
    "expected": [],
    "hidden": true
  }
];
