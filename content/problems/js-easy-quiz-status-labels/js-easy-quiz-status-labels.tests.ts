import type { TestCase } from "@content/_authoring/types";

export const functionName = "quizStatusLabels";

export const tests: TestCase[] = [
  {
    "name": "labels boolean values",
    "args": [
      [
        true,
        false,
        true
      ]
    ],
    "expected": [
      "yes",
      "no",
      "yes"
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      []
    ],
    "expected": []
  },
  {
    "name": "labels false values",
    "args": [
      [
        false,
        false
      ]
    ],
    "expected": [
      "no",
      "no"
    ],
    "hidden": true
  }
];
