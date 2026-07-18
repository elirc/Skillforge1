import type { TestCase } from "@content/_authoring/types";

export const functionName = "orderPartitionActive";

export const tests: TestCase[] = [
  {
    "name": "splits active and inactive",
    "args": [
      [
        {
          "id": "1",
          "isActive": true
        },
        {
          "id": "2",
          "isActive": false
        }
      ]
    ],
    "expected": {
      "active": [
        {
          "id": "1",
          "isActive": true
        }
      ],
      "inactive": [
        {
          "id": "2",
          "isActive": false
        }
      ]
    }
  },
  {
    "name": "handles empty lists",
    "args": [
      []
    ],
    "expected": {
      "active": [],
      "inactive": []
    }
  },
  {
    "name": "preserves inactive order",
    "args": [
      [
        {
          "id": "1",
          "isActive": false
        },
        {
          "id": "2",
          "isActive": false
        }
      ]
    ],
    "expected": {
      "active": [],
      "inactive": [
        {
          "id": "1",
          "isActive": false
        },
        {
          "id": "2",
          "isActive": false
        }
      ]
    },
    "hidden": true
  }
];
