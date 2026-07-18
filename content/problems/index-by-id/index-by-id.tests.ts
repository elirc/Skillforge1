import type { TestCase } from "@content/_authoring/types";

export const functionName = "indexById";

export const tests: TestCase[] = [
  {
    "name": "indexes items by id",
    "args": [
      [
        {
          "id": "a",
          "name": "Ada"
        },
        {
          "id": "g",
          "name": "Grace"
        }
      ]
    ],
    "expected": {
      "a": {
        "id": "a",
        "name": "Ada"
      },
      "g": {
        "id": "g",
        "name": "Grace"
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
    "name": "last duplicate id wins",
    "args": [
      [
        {
          "id": "x",
          "name": "Old"
        },
        {
          "id": "x",
          "name": "New"
        }
      ]
    ],
    "expected": {
      "x": {
        "id": "x",
        "name": "New"
      }
    },
    "hidden": true
  }
];
