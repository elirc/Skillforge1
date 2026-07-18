import type { TestCase } from "@content/_authoring/types";

export const functionName = "courseGroupByField";

export const tests: TestCase[] = [
  {
    "name": "groups records by field",
    "args": [
      [
        {
          "id": "1",
          "module": "alpha",
          "score": 2
        },
        {
          "id": "2",
          "module": "beta",
          "score": 5
        },
        {
          "id": "3",
          "module": "alpha",
          "score": 4
        }
      ],
      "module"
    ],
    "expected": {
      "alpha": [
        {
          "id": "1",
          "module": "alpha",
          "score": 2
        },
        {
          "id": "3",
          "module": "alpha",
          "score": 4
        }
      ],
      "beta": [
        {
          "id": "2",
          "module": "beta",
          "score": 5
        }
      ]
    }
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      "module"
    ],
    "expected": {}
  },
  {
    "name": "stringifies numeric values",
    "args": [
      [
        {
          "id": "a",
          "module": 1
        }
      ],
      "module"
    ],
    "expected": {
      "1": [
        {
          "id": "a",
          "module": 1
        }
      ]
    },
    "hidden": true
  }
];
