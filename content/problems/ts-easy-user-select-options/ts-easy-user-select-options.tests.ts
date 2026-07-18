import type { TestCase } from "@content/_authoring/types";

export const functionName = "userSelectOptions";

export const tests: TestCase[] = [
  {
    "name": "maps to select options",
    "args": [
      [
        {
          "id": "js",
          "name": "JavaScript"
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
          "name": "A"
        },
        {
          "id": "b",
          "name": "B"
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
