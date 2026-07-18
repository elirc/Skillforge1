import type { TestCase } from "@content/_authoring/types";

export const functionName = "dashboardVisibleLabels";

export const tests: TestCase[] = [
  {
    "name": "returns visible labels",
    "args": [
      [
        {
          "label": "A"
        },
        {
          "label": "B",
          "hidden": true
        }
      ]
    ],
    "expected": [
      "A"
    ]
  },
  {
    "name": "handles all hidden items",
    "args": [
      [
        {
          "label": "A",
          "hidden": true
        }
      ]
    ],
    "expected": []
  },
  {
    "name": "treats hidden false as visible",
    "args": [
      [
        {
          "label": "A",
          "hidden": false
        }
      ]
    ],
    "expected": [
      "A"
    ],
    "hidden": true
  }
];
