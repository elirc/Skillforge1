import type { TestCase } from "@content/_authoring/types";

export const functionName = "inventoryHasTarget";

export const tests: TestCase[] = [
  {
    "name": "finds present targets",
    "args": [
      [
        0,
        4,
        11,
        20
      ],
      4
    ],
    "expected": true
  },
  {
    "name": "rejects missing targets",
    "args": [
      [
        0,
        4,
        11,
        20
      ],
      9999
    ],
    "expected": false
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      0
    ],
    "expected": false,
    "hidden": true
  }
];
