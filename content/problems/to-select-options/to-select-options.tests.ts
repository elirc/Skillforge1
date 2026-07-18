import type { TestCase } from "@content/_authoring/types";

export const functionName = "toSelectOptions";

export const tests: TestCase[] = [
  {
    "name": "maps items to options",
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
