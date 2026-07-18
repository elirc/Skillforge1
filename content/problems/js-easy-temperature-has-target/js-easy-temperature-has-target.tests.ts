import type { TestCase } from "@content/_authoring/types";

export const functionName = "temperatureHasTarget";

export const tests: TestCase[] = [
  {
    "name": "finds present targets",
    "args": [
      [
        -3,
        0,
        8,
        15
      ],
      0
    ],
    "expected": true
  },
  {
    "name": "rejects missing targets",
    "args": [
      [
        -3,
        0,
        8,
        15
      ],
      9999
    ],
    "expected": false
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      -3
    ],
    "expected": false,
    "hidden": true
  }
];
