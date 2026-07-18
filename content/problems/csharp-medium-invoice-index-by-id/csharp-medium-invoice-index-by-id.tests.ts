import type { TestCase } from "@content/_authoring/types";

export const functionName = "invoiceIndexById";

export const tests: TestCase[] = [
  {
    "name": "indexes by id",
    "args": [
      [
        {
          "id": "a",
          "number": "Alpha"
        },
        {
          "id": "b",
          "number": "Beta"
        }
      ]
    ],
    "expected": {
      "a": {
        "id": "a",
        "number": "Alpha"
      },
      "b": {
        "id": "b",
        "number": "Beta"
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
          "number": "Old"
        },
        {
          "id": "a",
          "number": "New"
        }
      ]
    ],
    "expected": {
      "a": {
        "id": "a",
        "number": "New"
      }
    },
    "hidden": true
  }
];
