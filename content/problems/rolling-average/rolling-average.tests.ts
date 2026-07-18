import type { TestCase } from "@content/_authoring/types";

export const functionName = "rollingAverage";

export const tests: TestCase[] = [
  {
    "name": "averages windows",
    "args": [
      [
        2,
        4,
        6,
        8
      ],
      2
    ],
    "expected": [
      3,
      5,
      7
    ]
  },
  {
    "name": "handles exact window size",
    "args": [
      [
        1,
        2,
        3
      ],
      3
    ],
    "expected": [
      2
    ]
  },
  {
    "name": "returns empty when window is too large",
    "args": [
      [
        1,
        2
      ],
      3
    ],
    "expected": [],
    "hidden": true
  }
];
