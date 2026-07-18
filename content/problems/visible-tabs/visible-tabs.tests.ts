import type { TestCase } from "@content/_authoring/types";

export const functionName = "visibleTabs";

export const tests: TestCase[] = [
  {
    "name": "returns visible tab labels",
    "args": [
      [
        {
          "label": "Home"
        },
        {
          "label": "Admin",
          "hidden": true
        },
        {
          "label": "Profile"
        }
      ]
    ],
    "expected": [
      "Home",
      "Profile"
    ]
  },
  {
    "name": "handles all hidden tabs",
    "args": [
      [
        {
          "label": "Admin",
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
          "label": "Settings",
          "hidden": false
        }
      ]
    ],
    "expected": [
      "Settings"
    ],
    "hidden": true
  }
];
