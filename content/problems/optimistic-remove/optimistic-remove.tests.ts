import type { TestCase } from "@content/_authoring/types";

export const functionName = "optimisticRemove";

export const tests: TestCase[] = [
  {
    "name": "removes matching items",
    "args": [
      [
        {
          "id": "1",
          "label": "A"
        },
        {
          "id": "2",
          "label": "B"
        }
      ],
      "1"
    ],
    "expected": [
      {
        "id": "2",
        "label": "B"
      }
    ]
  },
  {
    "name": "keeps items when no id matches",
    "args": [
      [
        {
          "id": "1",
          "label": "A"
        }
      ],
      "x"
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
      [],
      "x"
    ],
    "expected": [],
    "hidden": true
  }
];
