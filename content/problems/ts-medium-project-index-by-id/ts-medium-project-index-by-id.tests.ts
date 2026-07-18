import type { TestCase } from "@content/_authoring/types";

export const functionName = "projectIndexById";

export const tests: TestCase[] = [
  {
    "name": "indexes by id",
    "args": [
      [
        {
          "id": "a",
          "title": "Alpha"
        },
        {
          "id": "b",
          "title": "Beta"
        }
      ]
    ],
    "expected": {
      "a": {
        "id": "a",
        "title": "Alpha"
      },
      "b": {
        "id": "b",
        "title": "Beta"
      }
    }
  },
  {
    "name": "handles empty arrays",
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
          "title": "Old"
        },
        {
          "id": "a",
          "title": "New"
        }
      ]
    ],
    "expected": {
      "a": {
        "id": "a",
        "title": "New"
      }
    },
    "hidden": true
  }
];
