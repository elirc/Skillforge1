import type { TestCase } from "@content/_authoring/types";

export const functionName = "quizClampAll";

export const tests: TestCase[] = [
  {
    "name": "clamps low and high values",
    "args": [
      [
        45,
        80,
        105
      ],
      50,
      100
    ],
    "expected": [
      50,
      80,
      100
    ]
  },
  {
    "name": "keeps values inside the range",
    "args": [
      [
        50,
        80
      ],
      50,
      100
    ],
    "expected": [
      50,
      80
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      [],
      50,
      100
    ],
    "expected": [],
    "hidden": true
  }
];
