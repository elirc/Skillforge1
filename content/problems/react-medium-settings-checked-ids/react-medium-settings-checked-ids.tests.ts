import type { TestCase } from "@content/_authoring/types";

export const functionName = "settingsCheckedIds";

export const tests: TestCase[] = [
  {
    "name": "adds checked ids",
    "args": [
      [
        "a"
      ],
      "b",
      true
    ],
    "expected": [
      "a",
      "b"
    ]
  },
  {
    "name": "removes unchecked ids",
    "args": [
      [
        "a",
        "b"
      ],
      "a",
      false
    ],
    "expected": [
      "b"
    ]
  },
  {
    "name": "does not duplicate ids",
    "args": [
      [
        "a"
      ],
      "a",
      true
    ],
    "expected": [
      "a"
    ],
    "hidden": true
  }
];
