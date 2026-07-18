import type { TestCase } from "@content/_authoring/types";

export const functionName = "summarizeInvoices";

export const tests: TestCase[] = [
  {
    "name": "summarizes paid and unpaid",
    "args": [
      [
        {
          "amount": 10,
          "paid": true
        },
        {
          "amount": 7,
          "paid": false
        }
      ]
    ],
    "expected": {
      "paid": 10,
      "unpaid": 7
    }
  },
  {
    "name": "starts totals at zero",
    "args": [
      []
    ],
    "expected": {
      "paid": 0,
      "unpaid": 0
    }
  },
  {
    "name": "adds multiple values per group",
    "args": [
      [
        {
          "amount": 2,
          "paid": true
        },
        {
          "amount": 3,
          "paid": true
        },
        {
          "amount": 4,
          "paid": false
        }
      ]
    ],
    "expected": {
      "paid": 5,
      "unpaid": 4
    },
    "hidden": true
  }
];
