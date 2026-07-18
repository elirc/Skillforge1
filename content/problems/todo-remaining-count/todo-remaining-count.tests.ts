import type { TestCase } from "@content/_authoring/types";

export const functionName = "todoRemainingCount";

export const tests: TestCase[] = [
  {
    "name": "counts incomplete todos",
    "args": [
      [
        {
          "id": "1",
          "text": "Ship",
          "completed": false
        },
        {
          "id": "2",
          "text": "Rest",
          "completed": true
        }
      ]
    ],
    "expected": 1
  },
  {
    "name": "returns zero when all are complete",
    "args": [
      [
        {
          "id": "1",
          "text": "Done",
          "completed": true
        }
      ]
    ],
    "expected": 0
  },
  {
    "name": "handles empty state",
    "args": [
      []
    ],
    "expected": 0,
    "hidden": true
  }
];
