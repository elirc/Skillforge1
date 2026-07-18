import type { TestCase } from "@content/_authoring/types";

export const functionName = "quizHasTarget";

export const tests: TestCase[] = [
  {
    "name": "finds present targets",
    "args": [
      [
        72,
        88,
        91,
        64
      ],
      88
    ],
    "expected": true
  },
  {
    "name": "rejects missing targets",
    "args": [
      [
        72,
        88,
        91,
        64
      ],
      9999
    ],
    "expected": false
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      72
    ],
    "expected": false,
    "hidden": true
  }
];
