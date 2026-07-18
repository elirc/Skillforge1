import type { TestCase } from "@content/_authoring/types";

export const functionName = "quizUppercaseLabels";

export const tests: TestCase[] = [
  {
    "name": "uppercases labels",
    "args": [
      [
        "open",
        "Done"
      ]
    ],
    "expected": [
      "OPEN",
      "DONE"
    ]
  },
  {
    "name": "handles empty strings",
    "args": [
      [
        ""
      ]
    ],
    "expected": [
      ""
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      []
    ],
    "expected": [],
    "hidden": true
  }
];
