import type { TestCase } from "@content/_authoring/types";

export const functionName = "pickDefined";

export const tests: TestCase[] = [
  {
    "name": "removes undefined values",
    "args": [
      {
        "name": "Ada"
      }
    ],
    "expected": {
      "name": "Ada"
    }
  },
  {
    "name": "keeps intentional falsy values",
    "args": [
      {
        "active": false,
        "count": 0,
        "note": ""
      }
    ],
    "expected": {
      "active": false,
      "count": 0,
      "note": ""
    }
  },
  {
    "name": "keeps null values",
    "args": [
      {
        "deletedAt": null
      }
    ],
    "expected": {
      "deletedAt": null
    },
    "hidden": true
  }
];
