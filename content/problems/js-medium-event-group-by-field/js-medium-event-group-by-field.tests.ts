import type { TestCase } from "@content/_authoring/types";

export const functionName = "eventGroupByField";

export const tests: TestCase[] = [
  {
    "name": "groups records by field",
    "args": [
      [
        {
          "id": "1",
          "type": "alpha",
          "score": 2
        },
        {
          "id": "2",
          "type": "beta",
          "score": 5
        },
        {
          "id": "3",
          "type": "alpha",
          "score": 4
        }
      ],
      "type"
    ],
    "expected": {
      "alpha": [
        {
          "id": "1",
          "type": "alpha",
          "score": 2
        },
        {
          "id": "3",
          "type": "alpha",
          "score": 4
        }
      ],
      "beta": [
        {
          "id": "2",
          "type": "beta",
          "score": 5
        }
      ]
    }
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      "type"
    ],
    "expected": {}
  },
  {
    "name": "stringifies numeric values",
    "args": [
      [
        {
          "id": "a",
          "type": 1
        }
      ],
      "type"
    ],
    "expected": {
      "1": [
        {
          "id": "a",
          "type": 1
        }
      ]
    },
    "hidden": true
  }
];
