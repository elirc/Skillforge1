import type { TestCase } from "@content/_authoring/types";

export const functionName = "accountIndexById";

export const tests: TestCase[] = [
  {
    "name": "indexes by id",
    "args": [
      [
        {
          "id": "a",
          "displayName": "Alpha"
        },
        {
          "id": "b",
          "displayName": "Beta"
        }
      ]
    ],
    "expected": {
      "a": {
        "id": "a",
        "displayName": "Alpha"
      },
      "b": {
        "id": "b",
        "displayName": "Beta"
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
          "displayName": "Old"
        },
        {
          "id": "a",
          "displayName": "New"
        }
      ]
    ],
    "expected": {
      "a": {
        "id": "a",
        "displayName": "New"
      }
    },
    "hidden": true
  }
];
