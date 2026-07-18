import type { TestCase } from "@content/_authoring/types";

export const functionName = "productTotalPrice";

export const tests: TestCase[] = [
  {
    "name": "totals amounts",
    "args": [
      [
        {
          "price": 10
        },
        {
          "price": 15
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
          "price": 10
        },
        {
          "price": -3
        }
      ]
    ],
    "expected": 7,
    "hidden": true
  }
];
