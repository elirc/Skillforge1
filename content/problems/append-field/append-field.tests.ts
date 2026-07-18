import type { TestCase } from "@content/_authoring/types";

export const functionName = "appendField";

export const tests: TestCase[] = [
  {
    "name": "appends a field value",
    "args": [
      [
        "a"
      ],
      "b"
    ],
    "expected": [
      "a",
      "b"
    ]
  },
  {
    "name": "works with empty arrays",
    "args": [
      [],
      "first"
    ],
    "expected": [
      "first"
    ]
  },
  {
    "name": "keeps empty strings as values",
    "args": [
      [
        "a"
      ],
      ""
    ],
    "expected": [
      "a",
      ""
    ],
    "hidden": true
  }
];
