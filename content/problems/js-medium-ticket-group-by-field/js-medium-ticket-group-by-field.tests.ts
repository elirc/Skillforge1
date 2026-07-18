import type { TestCase } from "@content/_authoring/types";

export const functionName = "ticketGroupByField";

export const tests: TestCase[] = [
  {
    "name": "groups records by field",
    "args": [
      [
        {
          "id": "1",
          "status": "alpha",
          "score": 2
        },
        {
          "id": "2",
          "status": "beta",
          "score": 5
        },
        {
          "id": "3",
          "status": "alpha",
          "score": 4
        }
      ],
      "status"
    ],
    "expected": {
      "alpha": [
        {
          "id": "1",
          "status": "alpha",
          "score": 2
        },
        {
          "id": "3",
          "status": "alpha",
          "score": 4
        }
      ],
      "beta": [
        {
          "id": "2",
          "status": "beta",
          "score": 5
        }
      ]
    }
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      "status"
    ],
    "expected": {}
  },
  {
    "name": "stringifies numeric values",
    "args": [
      [
        {
          "id": "a",
          "status": 1
        }
      ],
      "status"
    ],
    "expected": {
      "1": [
        {
          "id": "a",
          "status": 1
        }
      ]
    },
    "hidden": true
  }
];
