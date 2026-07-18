import type { TestCase } from "@content/_authoring/types";

export const functionName = "productGroupByField";

export const tests: TestCase[] = [
  {
    "name": "groups records by field",
    "args": [
      [
        {
          "id": "1",
          "category": "alpha",
          "score": 2
        },
        {
          "id": "2",
          "category": "beta",
          "score": 5
        },
        {
          "id": "3",
          "category": "alpha",
          "score": 4
        }
      ],
      "category"
    ],
    "expected": {
      "alpha": [
        {
          "id": "1",
          "category": "alpha",
          "score": 2
        },
        {
          "id": "3",
          "category": "alpha",
          "score": 4
        }
      ],
      "beta": [
        {
          "id": "2",
          "category": "beta",
          "score": 5
        }
      ]
    }
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      "category"
    ],
    "expected": {}
  },
  {
    "name": "stringifies numeric values",
    "args": [
      [
        {
          "id": "a",
          "category": 1
        }
      ],
      "category"
    ],
    "expected": {
      "1": [
        {
          "id": "a",
          "category": 1
        }
      ]
    },
    "hidden": true
  }
];
