import type { TestCase } from "@content/_authoring/types";

export const functionName = "temperatureClampAll";

export const tests: TestCase[] = [
  {
    "name": "clamps low and high values",
    "args": [
      [
        -15,
        5,
        30
      ],
      -10,
      25
    ],
    "expected": [
      -10,
      5,
      25
    ]
  },
  {
    "name": "keeps values inside the range",
    "args": [
      [
        -10,
        5
      ],
      -10,
      25
    ],
    "expected": [
      -10,
      5
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      [],
      -10,
      25
    ],
    "expected": [],
    "hidden": true
  }
];
