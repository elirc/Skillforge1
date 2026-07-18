import type { TestCase } from "@content/_authoring/types";

export const functionName = "teamSelectOptions";

export const tests: TestCase[] = [
  {
    "name": "maps to select options",
    "args": [
      [
        {
          "id": "js",
          "label": "JavaScript"
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
          "label": "A"
        },
        {
          "id": "b",
          "label": "B"
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
