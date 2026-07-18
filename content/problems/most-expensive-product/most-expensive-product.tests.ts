import type { TestCase } from "@content/_authoring/types";

export const functionName = "mostExpensiveProduct";

export const tests: TestCase[] = [
  {
    "name": "finds the highest price",
    "args": [
      [
        {
          "name": "Pen",
          "price": 2
        },
        {
          "name": "Bag",
          "price": 30
        },
        {
          "name": "Mug",
          "price": 12
        }
      ]
    ],
    "expected": "Bag"
  },
  {
    "name": "returns empty for no products",
    "args": [
      []
    ],
    "expected": ""
  },
  {
    "name": "keeps the first product when prices tie",
    "args": [
      [
        {
          "name": "A",
          "price": 5
        },
        {
          "name": "B",
          "price": 5
        }
      ]
    ],
    "expected": "A",
    "hidden": true
  }
];
