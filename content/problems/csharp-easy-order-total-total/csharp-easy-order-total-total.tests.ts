import type { TestCase } from "@content/_authoring/types";

export const functionName = "orderTotalTotal";

export const tests: TestCase[] = [
  {
    "name": "totals amounts",
    "args": [
      [
        {
          "total": 10
        },
        {
          "total": 15
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
          "total": 10
        },
        {
          "total": -3
        }
      ]
    ],
    "expected": 7,
    "hidden": true
  }
];
