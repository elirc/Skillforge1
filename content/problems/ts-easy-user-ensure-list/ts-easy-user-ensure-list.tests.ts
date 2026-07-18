import type { TestCase } from "@content/_authoring/types";

export const functionName = "userEnsureList";

export const tests: TestCase[] = [
  {
    "name": "wraps a single value",
    "args": [
      "one"
    ],
    "expected": [
      "one"
    ]
  },
  {
    "name": "keeps arrays",
    "args": [
      [
        1,
        2
      ]
    ],
    "expected": [
      1,
      2
    ]
  },
  {
    "name": "wraps objects",
    "args": [
      {
        "id": "a"
      }
    ],
    "expected": [
      {
        "id": "a"
      }
    ],
    "hidden": true
  }
];
