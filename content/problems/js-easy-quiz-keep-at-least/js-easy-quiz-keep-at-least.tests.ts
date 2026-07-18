import type { TestCase } from "@content/_authoring/types";

export const functionName = "quizKeepAtLeast";

export const tests: TestCase[] = [
  {
    "name": "keeps qualifying values",
    "args": [
      [
        72,
        88,
        91,
        64
      ],
      80
    ],
    "expected": [
      88,
      91
    ]
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      80
    ],
    "expected": []
  },
  {
    "name": "keeps values equal to minimum",
    "args": [
      [
        79,
        80,
        82
      ],
      80
    ],
    "expected": [
      80,
      82
    ],
    "hidden": true
  }
];
