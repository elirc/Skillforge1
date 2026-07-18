import type { TestCase } from "@content/_authoring/types";

export const functionName = "calculateCartTotal";

export const tests: TestCase[] = [
  {
    "name": "totals cart lines",
    "args": [
      [
        {
          "quantity": 2,
          "unitPrice": 3
        },
        {
          "quantity": 1,
          "unitPrice": 10
        }
      ]
    ],
    "expected": 16
  },
  {
    "name": "returns zero for an empty cart",
    "args": [
      []
    ],
    "expected": 0
  },
  {
    "name": "handles decimal prices",
    "args": [
      [
        {
          "quantity": 3,
          "unitPrice": 2.5
        }
      ]
    ],
    "expected": 7.5,
    "hidden": true
  }
];
