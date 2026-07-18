import type { TestCase } from "@content/_authoring/types";

export const functionName = "workoutKeepAtLeast";

export const tests: TestCase[] = [
  {
    "name": "keeps qualifying values",
    "args": [
      [
        5,
        10,
        12,
        0
      ],
      8
    ],
    "expected": [
      10,
      12
    ]
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      8
    ],
    "expected": []
  },
  {
    "name": "keeps values equal to minimum",
    "args": [
      [
        7,
        8,
        10
      ],
      8
    ],
    "expected": [
      8,
      10
    ],
    "hidden": true
  }
];
