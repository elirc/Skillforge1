import type { TestCase } from "@content/_authoring/types";

export const functionName = "orderActiveCount";

export const tests: TestCase[] = [
  {
    "name": "counts active items",
    "args": [
      [
        {
          "id": "1",
          "isActive": true
        },
        {
          "id": "2",
          "isActive": false
        }
      ]
    ],
    "expected": 1
  },
  {
    "name": "returns zero when none are active",
    "args": [
      [
        {
          "id": "1",
          "isActive": false
        }
      ]
    ],
    "expected": 0
  },
  {
    "name": "handles empty lists",
    "args": [
      []
    ],
    "expected": 0,
    "hidden": true
  }
];
