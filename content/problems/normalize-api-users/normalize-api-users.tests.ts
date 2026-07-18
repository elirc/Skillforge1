import type { TestCase } from "@content/_authoring/types";

export const functionName = "normalizeApiUsers";

export const tests: TestCase[] = [
  {
    "name": "normalizes users",
    "args": [
      [
        {
          "id": "1",
          "display_name": "Ada",
          "is_active": true
        }
      ]
    ],
    "expected": [
      {
        "id": "1",
        "displayName": "Ada",
        "isActive": true
      }
    ]
  },
  {
    "name": "handles multiple users",
    "args": [
      [
        {
          "id": "1",
          "display_name": "Ada",
          "is_active": true
        },
        {
          "id": "2",
          "display_name": "Grace",
          "is_active": false
        }
      ]
    ],
    "expected": [
      {
        "id": "1",
        "displayName": "Ada",
        "isActive": true
      },
      {
        "id": "2",
        "displayName": "Grace",
        "isActive": false
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
