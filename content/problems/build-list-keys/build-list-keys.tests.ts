import type { TestCase } from "@content/_authoring/types";

export const functionName = "buildListKeys";

export const tests: TestCase[] = [
  {
    "name": "uses ids when present",
    "args": [
      [
        {
          "id": "a",
          "label": "A"
        },
        {
          "id": 2,
          "label": "B"
        }
      ]
    ],
    "expected": [
      "a",
      "2"
    ]
  },
  {
    "name": "falls back to index",
    "args": [
      [
        {
          "label": "A"
        },
        {
          "label": "B"
        }
      ]
    ],
    "expected": [
      "fallback-0",
      "fallback-1"
    ]
  },
  {
    "name": "mixes ids and fallbacks",
    "args": [
      [
        {
          "id": "x",
          "label": "X"
        },
        {
          "label": "Y"
        }
      ]
    ],
    "expected": [
      "x",
      "fallback-1"
    ],
    "hidden": true
  }
];
