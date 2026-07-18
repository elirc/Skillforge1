import type { TestCase } from "@content/_authoring/types";

export const functionName = "accountSelectOptions";

export const tests: TestCase[] = [
  {
    "name": "maps to select options",
    "args": [
      [
        {
          "id": "js",
          "displayName": "JavaScript"
        }
      ]
    ],
    "expected": [
      {
        "value": "js",
        "label": "JavaScript"
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
    "name": "preserves order",
    "args": [
      [
        {
          "id": "a",
          "displayName": "A"
        },
        {
          "id": "b",
          "displayName": "B"
        }
      ]
    ],
    "expected": [
      {
        "value": "a",
        "label": "A"
      },
      {
        "value": "b",
        "label": "B"
      }
    ],
    "hidden": true
  }
];
