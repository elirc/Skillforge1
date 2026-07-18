import type { TestCase } from "@content/_authoring/types";

export const functionName = "isSortedAscending";

export const tests: TestCase[] = [
  {
    "name": "accepts sorted arrays",
    "args": [
      [
        1,
        2,
        2,
        4
      ]
    ],
    "expected": true
  },
  {
    "name": "rejects unsorted arrays",
    "args": [
      [
        1,
        3,
        2
      ]
    ],
    "expected": false
  },
  {
    "name": "accepts empty arrays",
    "args": [
      []
    ],
    "expected": true,
    "hidden": true
  }
];
