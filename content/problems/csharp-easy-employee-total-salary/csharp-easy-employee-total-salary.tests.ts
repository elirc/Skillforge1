import type { TestCase } from "@content/_authoring/types";

export const functionName = "employeeTotalSalary";

export const tests: TestCase[] = [
  {
    "name": "totals amounts",
    "args": [
      [
        {
          "salary": 10
        },
        {
          "salary": 15
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
          "salary": 10
        },
        {
          "salary": -3
        }
      ]
    ],
    "expected": 7,
    "hidden": true
  }
];
