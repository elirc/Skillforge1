import type { TestCase } from "@content/_authoring/types";

export const functionName = "partitionResults";

export const tests: TestCase[] = [
  {
    "name": "splits mixed results",
    "args": [
      [
        {
          "status": "success",
          "id": "1"
        },
        {
          "status": "error",
          "id": "2",
          "message": "Nope"
        }
      ]
    ],
    "expected": {
      "success": [
        {
          "status": "success",
          "id": "1"
        }
      ],
      "error": [
        {
          "status": "error",
          "id": "2",
          "message": "Nope"
        }
      ]
    }
  },
  {
    "name": "handles no results",
    "args": [
      []
    ],
    "expected": {
      "success": [],
      "error": []
    }
  },
  {
    "name": "preserves order inside groups",
    "args": [
      [
        {
          "status": "error",
          "id": "a",
          "message": "A"
        },
        {
          "status": "error",
          "id": "b",
          "message": "B"
        }
      ]
    ],
    "expected": {
      "success": [],
      "error": [
        {
          "status": "error",
          "id": "a",
          "message": "A"
        },
        {
          "status": "error",
          "id": "b",
          "message": "B"
        }
      ]
    },
    "hidden": true
  }
];
