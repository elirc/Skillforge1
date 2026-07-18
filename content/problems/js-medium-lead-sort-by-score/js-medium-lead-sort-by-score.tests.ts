import type { TestCase } from "@content/_authoring/types";

export const functionName = "leadSortByScore";

export const tests: TestCase[] = [
  {
    "name": "sorts high to low",
    "args": [
      [
        {
          "id": "a",
          "score": 2
        },
        {
          "id": "b",
          "score": 5
        },
        {
          "id": "c",
          "score": 3
        }
      ]
    ],
    "expected": [
      {
        "id": "b",
        "score": 5
      },
      {
        "id": "c",
        "score": 3
      },
      {
        "id": "a",
        "score": 2
      }
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      []
    ],
    "expected": []
  },
  {
    "name": "handles one item",
    "args": [
      [
        {
          "id": "a",
          "score": 1
        }
      ]
    ],
    "expected": [
      {
        "id": "a",
        "score": 1
      }
    ],
    "hidden": true
  }
];
