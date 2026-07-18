import type { TestCase } from "@content/_authoring/types";

export const functionName = "latencyHasTarget";

export const tests: TestCase[] = [
  {
    "name": "finds present targets",
    "args": [
      [
        120,
        80,
        250,
        40
      ],
      80
    ],
    "expected": true
  },
  {
    "name": "rejects missing targets",
    "args": [
      [
        120,
        80,
        250,
        40
      ],
      9999
    ],
    "expected": false
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      120
    ],
    "expected": false,
    "hidden": true
  }
];
