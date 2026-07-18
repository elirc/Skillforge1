import type { TestCase } from "@content/_authoring/types";

export const functionName = "activeTeamCount";

export const tests: TestCase[] = [
  {
    "name": "counts active items",
    "args": [
      [
        {
          "id": "1",
          "active": true
        },
        {
          "id": "2",
          "active": false
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
          "active": false
        }
      ]
    ],
    "expected": 0
  },
  {
    "name": "handles empty arrays",
    "args": [
      []
    ],
    "expected": 0,
    "hidden": true
  }
];
