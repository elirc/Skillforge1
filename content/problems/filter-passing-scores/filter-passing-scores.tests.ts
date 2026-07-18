import type { TestCase } from "@content/_authoring/types";

export const functionName = "filterPassingScores";

export const tests: TestCase[] = [
  {
    "name": "keeps scores at or above the threshold",
    "args": [
      [
        72,
        88,
        59,
        90
      ],
      70
    ],
    "expected": [
      72,
      88,
      90
    ]
  },
  {
    "name": "keeps values equal to the threshold",
    "args": [
      [
        60,
        61,
        59
      ],
      60
    ],
    "expected": [
      60,
      61
    ]
  },
  {
    "name": "returns empty when no scores pass",
    "args": [
      [
        10,
        20
      ],
      50
    ],
    "expected": [],
    "hidden": true
  }
];
