import type { TestCase } from "@content/_authoring/types";

export const functionName = "removeFieldAt";

export const tests: TestCase[] = [
  {
    "name": "removes the requested index",
    "args": [
      [
        "a",
        "b",
        "c"
      ],
      1
    ],
    "expected": [
      "a",
      "c"
    ]
  },
  {
    "name": "handles first item",
    "args": [
      [
        "a",
        "b"
      ],
      0
    ],
    "expected": [
      "b"
    ]
  },
  {
    "name": "out of range keeps values",
    "args": [
      [
        "a"
      ],
      5
    ],
    "expected": [
      "a"
    ],
    "hidden": true
  }
];
