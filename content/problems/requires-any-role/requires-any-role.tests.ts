import type { TestCase } from "@content/_authoring/types";

export const functionName = "requiresAnyRole";

export const tests: TestCase[] = [
  {
    "name": "allows matching roles",
    "args": [
      [
        "admin",
        "editor"
      ],
      [
        "admin"
      ]
    ],
    "expected": true
  },
  {
    "name": "rejects missing roles",
    "args": [
      [
        "viewer"
      ],
      [
        "admin",
        "editor"
      ]
    ],
    "expected": false
  },
  {
    "name": "handles empty allowed roles",
    "args": [
      [
        "admin"
      ],
      []
    ],
    "expected": false,
    "hidden": true
  }
];
