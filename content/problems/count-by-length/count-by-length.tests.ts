import type { TestCase } from "@content/_authoring/types";

export const functionName = "countByLength";

export const tests: TestCase[] = [
  {
    "name": "counts word lengths",
    "args": [
      [
        "hi",
        "cat",
        "dog",
        "tree"
      ]
    ],
    "expected": {
      "2": 1,
      "3": 2,
      "4": 1
    }
  },
  {
    "name": "handles empty arrays",
    "args": [
      []
    ],
    "expected": {}
  },
  {
    "name": "counts empty strings",
    "args": [
      [
        "",
        "a"
      ]
    ],
    "expected": {
      "0": 1,
      "1": 1
    },
    "hidden": true
  }
];
