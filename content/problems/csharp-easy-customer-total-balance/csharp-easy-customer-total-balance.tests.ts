import type { TestCase } from "@content/_authoring/types";

export const functionName = "customerTotalBalance";

export const tests: TestCase[] = [
  {
    "name": "totals amounts",
    "args": [
      [
        {
          "balance": 10
        },
        {
          "balance": 15
        }
      ]
    ],
    "expected": 25
  },
  {
    "name": "returns zero for empty lists",
    "args": [
      []
    ],
    "expected": 0
  },
  {
    "name": "handles negative adjustments",
    "args": [
      [
        {
          "balance": 10
        },
        {
          "balance": -3
        }
      ]
    ],
    "expected": 7,
    "hidden": true
  }
];
