import type { TestCase } from "@content/_authoring/types";

export const functionName = "projectSelectOptions";

export const tests: TestCase[] = [
  {
    "name": "maps to select options",
    "args": [
      [
        {
          "id": "js",
          "title": "JavaScript"
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
          "title": "A"
        },
        {
          "id": "b",
          "title": "B"
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
