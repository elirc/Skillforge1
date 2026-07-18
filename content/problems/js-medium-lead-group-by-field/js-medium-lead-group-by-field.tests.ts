import type { TestCase } from "@content/_authoring/types";

export const functionName = "leadGroupByField";

export const tests: TestCase[] = [
  {
    "name": "groups records by field",
    "args": [
      [
        {
          "id": "1",
          "source": "alpha",
          "score": 2
        },
        {
          "id": "2",
          "source": "beta",
          "score": 5
        },
        {
          "id": "3",
          "source": "alpha",
          "score": 4
        }
      ],
      "source"
    ],
    "expected": {
      "alpha": [
        {
          "id": "1",
          "source": "alpha",
          "score": 2
        },
        {
          "id": "3",
          "source": "alpha",
          "score": 4
        }
      ],
      "beta": [
        {
          "id": "2",
          "source": "beta",
          "score": 5
        }
      ]
    }
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      "source"
    ],
    "expected": {}
  },
  {
    "name": "stringifies numeric values",
    "args": [
      [
        {
          "id": "a",
          "source": 1
        }
      ],
      "source"
    ],
    "expected": {
      "1": [
        {
          "id": "a",
          "source": 1
        }
      ]
    },
    "hidden": true
  }
];
