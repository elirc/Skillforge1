import type { TestCase } from "@content/_authoring/types";

export const functionName = "invoiceTotalAmount";

export const tests: TestCase[] = [
  {
    "name": "totals amounts",
    "args": [
      [
        {
          "amount": 10
        },
        {
          "amount": 15
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
          "amount": 10
        },
        {
          "amount": -3
        }
      ]
    ],
    "expected": 7,
    "hidden": true
  }
];
