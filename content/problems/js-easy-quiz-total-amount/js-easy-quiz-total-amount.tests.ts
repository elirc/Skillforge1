import type { TestCase } from "@content/_authoring/types";

export const functionName = "quizTotalAmount";

export const tests: TestCase[] = [
  {
    "name": "totals amounts",
    "args": [
      [
        {
          "amount": 3
        },
        {
          "amount": 7
        }
      ]
    ],
    "expected": 10
  },
  {
    "name": "returns zero for no rows",
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
          "amount": 5
        },
        {
          "amount": -2
        }
      ]
    ],
    "expected": 3,
    "hidden": true
  }
];
