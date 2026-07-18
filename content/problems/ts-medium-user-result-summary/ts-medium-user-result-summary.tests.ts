import type { TestCase } from "@content/_authoring/types";

export const functionName = "userResultSummary";

export const tests: TestCase[] = [
  {
    "name": "counts success and failure",
    "args": [
      [
        {
          "ok": true,
          "id": "1"
        },
        {
          "ok": false,
          "error": "Bad"
        }
      ]
    ],
    "expected": {
      "success": 1,
      "failure": 1
    }
  },
  {
    "name": "handles empty results",
    "args": [
      []
    ],
    "expected": {
      "success": 0,
      "failure": 0
    }
  },
  {
    "name": "counts multiple successes",
    "args": [
      [
        {
          "ok": true,
          "id": "1"
        },
        {
          "ok": true,
          "id": "2"
        }
      ]
    ],
    "expected": {
      "success": 2,
      "failure": 0
    },
    "hidden": true
  }
];
