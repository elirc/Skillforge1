import type { TestCase } from "@content/_authoring/types";

export const functionName = "groupByProperty";

export const tests: TestCase[] = [
  {
    "name": "groups by status",
    "args": [
      [
        {
          "id": 1,
          "status": "open"
        },
        {
          "id": 2,
          "status": "done"
        },
        {
          "id": 3,
          "status": "open"
        }
      ],
      "status"
    ],
    "expected": {
      "open": [
        {
          "id": 1,
          "status": "open"
        },
        {
          "id": 3,
          "status": "open"
        }
      ],
      "done": [
        {
          "id": 2,
          "status": "done"
        }
      ]
    }
  },
  {
    "name": "handles empty arrays",
    "args": [
      [],
      "status"
    ],
    "expected": {}
  },
  {
    "name": "stringifies numeric keys",
    "args": [
      [
        {
          "id": 1,
          "team": 2
        }
      ],
      "team"
    ],
    "expected": {
      "2": [
        {
          "id": 1,
          "team": 2
        }
      ]
    },
    "hidden": true
  }
];
