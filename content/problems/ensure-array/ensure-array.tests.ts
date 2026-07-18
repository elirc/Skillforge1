import type { TestCase } from "@content/_authoring/types";

export const functionName = "ensureArray";

export const tests: TestCase[] = [
  {
    "name": "wraps a single value",
    "args": [
      "read"
    ],
    "expected": [
      "read"
    ]
  },
  {
    "name": "keeps arrays as arrays",
    "args": [
      [
        1,
        2,
        3
      ]
    ],
    "expected": [
      1,
      2,
      3
    ]
  },
  {
    "name": "wraps objects too",
    "args": [
      {
        "id": 1
      }
    ],
    "expected": [
      {
        "id": 1
      }
    ],
    "hidden": true
  }
];
