import type { TestCase } from "@content/_authoring/types";

export const functionName = "workspacePartitionActive";

export const tests: TestCase[] = [
  {
    "name": "partitions active items",
    "args": [
      [
        {
          "id": "1",
          "active": true
        },
        {
          "id": "2",
          "active": false
        }
      ]
    ],
    "expected": {
      "active": [
        {
          "id": "1",
          "active": true
        }
      ],
      "inactive": [
        {
          "id": "2",
          "active": false
        }
      ]
    }
  },
  {
    "name": "handles empty arrays",
    "args": [
      []
    ],
    "expected": {
      "active": [],
      "inactive": []
    }
  },
  {
    "name": "preserves group order",
    "args": [
      [
        {
          "id": "1",
          "active": false
        },
        {
          "id": "2",
          "active": false
        }
      ]
    ],
    "expected": {
      "active": [],
      "inactive": [
        {
          "id": "1",
          "active": false
        },
        {
          "id": "2",
          "active": false
        }
      ]
    },
    "hidden": true
  }
];
