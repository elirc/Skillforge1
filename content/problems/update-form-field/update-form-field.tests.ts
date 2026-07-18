import type { TestCase } from "@content/_authoring/types";

export const functionName = "updateFormField";

export const tests: TestCase[] = [
  {
    "name": "updates an existing field",
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
    "name": "adds a new field",
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
    "name": "can clear a field",
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
