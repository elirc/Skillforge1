import type { TestCase } from "@content/_authoring/types";

export const functionName = "workoutClampAll";

export const tests: TestCase[] = [
  {
    "name": "clamps low and high values",
    "args": [
      [
        -4,
        8,
        25
      ],
      1,
      20
    ],
    "expected": [
      1,
      8,
      20
    ]
  },
  {
    "name": "keeps values inside the range",
    "args": [
      [
        1,
        8
      ],
      1,
      20
    ],
    "expected": [
      1,
      8
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      [],
      1,
      20
    ],
    "expected": [],
    "hidden": true
  }
];
