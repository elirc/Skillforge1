import type { TestCase } from "@content/_authoring/types";

export const functionName = "latencyScaleValues";

export const tests: TestCase[] = [
  {
    "name": "scales each value",
    "args": [
      [
        1,
        2,
        3
      ],
      6
    ],
    "expected": [
      6,
      12,
      18
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
      6
    ],
    "expected": [],
    "hidden": true
  }
];
