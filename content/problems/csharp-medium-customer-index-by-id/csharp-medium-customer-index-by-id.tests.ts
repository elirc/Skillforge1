import type { TestCase } from "@content/_authoring/types";

export const functionName = "customerIndexById";

export const tests: TestCase[] = [
  {
    "name": "indexes by id",
    "args": [
      [
        {
          "id": "a",
          "name": "Alpha"
        },
        {
          "id": "b",
          "name": "Beta"
        }
      ]
    ],
    "expected": {
      "a": {
        "id": "a",
        "name": "Alpha"
      },
      "b": {
        "id": "b",
        "name": "Beta"
      }
    }
  },
  {
    "name": "handles empty lists",
    "args": [
      []
    ],
    "expected": {}
  },
  {
    "name": "last duplicate wins",
    "args": [
      [
        {
          "id": "a",
          "name": "Old"
        },
        {
          "id": "a",
          "name": "New"
        }
      ]
    ],
    "expected": {
      "a": {
        "id": "a",
        "name": "New"
      }
    },
    "hidden": true
  }
];
