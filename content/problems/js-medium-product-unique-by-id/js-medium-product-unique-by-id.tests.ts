import type { TestCase } from "@content/_authoring/types";

export const functionName = "productUniqueById";

export const tests: TestCase[] = [
  {
    "name": "keeps first item per id",
    "args": [
      [
        {
          "id": "1",
          "label": "A"
        },
        {
          "id": "1",
          "label": "B"
        },
        {
          "id": "2",
          "label": "C"
        }
      ]
    ],
    "expected": [
      {
        "id": "1",
        "label": "A"
      },
      {
        "id": "2",
        "label": "C"
      }
    ]
  },
  {
    "name": "handles no duplicates",
    "args": [
      [
        {
          "id": "1",
          "label": "A"
        }
      ]
    ],
    "expected": [
      {
        "id": "1",
        "label": "A"
      }
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      []
    ],
    "expected": [],
    "hidden": true
  }
];
