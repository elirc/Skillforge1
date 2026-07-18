import type { TestCase } from "@content/_authoring/types";

export const functionName = "temperatureKeepAtLeast";

export const tests: TestCase[] = [
  {
    "name": "keeps qualifying values",
    "args": [
      [
        -3,
        0,
        8,
        15
      ],
      5
    ],
    "expected": [
      8,
      15
    ]
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      5
    ],
    "expected": []
  },
  {
    "name": "keeps values equal to minimum",
    "args": [
      [
        4,
        5,
        7
      ],
      5
    ],
    "expected": [
      5,
      7
    ],
    "hidden": true
  }
];
