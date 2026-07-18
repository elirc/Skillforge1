import type { TestCase } from "@content/_authoring/types";

export const functionName = "inventoryTotal";

export const tests: TestCase[] = [
  {
    "name": "totals multiple items",
    "args": [
      [
        {
          "quantity": 2,
          "price": 5
        },
        {
          "quantity": 3,
          "price": 4
        }
      ]
    ],
    "expected": 22
  },
  {
    "name": "returns zero for no items",
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
          "quantity": 4,
          "price": 2.5
        }
      ]
    ],
    "expected": 10,
    "hidden": true
  }
];
