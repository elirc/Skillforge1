import type { TestCase } from "@content/_authoring/types";

export const functionName = "dashboardUpdateField";

export const tests: TestCase[] = [
  {
    "name": "updates existing fields",
    "args": [
      {
        "name": "Ada",
        "email": ""
      },
      "email",
      "ada@example.com"
    ],
    "expected": {
      "name": "Ada",
      "email": "ada@example.com"
    }
  },
  {
    "name": "adds new fields",
    "args": [
      {
        "name": "Ada"
      },
      "role",
      "admin"
    ],
    "expected": {
      "name": "Ada",
      "role": "admin"
    }
  },
  {
    "name": "can clear values",
    "args": [
      {
        "search": "abc"
      },
      "search",
      ""
    ],
    "expected": {
      "search": ""
    },
    "hidden": true
  }
];
