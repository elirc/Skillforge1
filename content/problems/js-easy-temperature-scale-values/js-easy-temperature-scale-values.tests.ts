import type { TestCase } from "@content/_authoring/types";

export const functionName = "temperatureScaleValues";

export const tests: TestCase[] = [
  {
    "name": "scales each value",
    "args": [
      [
        1,
        2,
        3
      ],
      3
    ],
    "expected": [
      3,
      6,
      9
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
      3
    ],
    "expected": [],
    "hidden": true
  }
];
