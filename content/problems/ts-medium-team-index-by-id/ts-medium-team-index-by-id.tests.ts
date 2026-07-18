import type { TestCase } from "@content/_authoring/types";

export const functionName = "teamIndexById";

export const tests: TestCase[] = [
  {
    "name": "indexes by id",
    "args": [
      [
        {
          "id": "a",
          "label": "Alpha"
        },
        {
          "id": "b",
          "label": "Beta"
        }
      ]
    ],
    "expected": {
      "a": {
        "id": "a",
        "label": "Alpha"
      },
      "b": {
        "id": "b",
        "label": "Beta"
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
          "label": "Old"
        },
        {
          "id": "a",
          "label": "New"
        }
      ]
    ],
    "expected": {
      "a": {
        "id": "a",
        "label": "New"
      }
    },
    "hidden": true
  }
];
