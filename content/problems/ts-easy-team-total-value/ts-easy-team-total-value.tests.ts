import type { TestCase } from "@content/_authoring/types";

export const functionName = "teamTotalValue";

export const tests: TestCase[] = [
  {
    "name": "totals values",
    "args": [
      [
        {
          "value": 3
        },
        {
          "value": 7
        }
      ]
    ],
    "expected": 10
  },
  {
    "name": "returns zero for no values",
    "args": [
      []
    ],
    "expected": 0
  },
  {
    "name": "handles negatives",
    "args": [
      [
        {
          "value": 4
        },
        {
          "value": -1
        }
      ]
    ],
    "expected": 3,
    "hidden": true
  }
];
