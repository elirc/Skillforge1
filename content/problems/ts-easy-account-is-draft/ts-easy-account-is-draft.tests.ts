import type { TestCase } from "@content/_authoring/types";

export const functionName = "accountIsDraft";

export const tests: TestCase[] = [
  {
    "name": "accepts draft",
    "args": [
      "draft"
    ],
    "expected": true
  },
  {
    "name": "rejects published",
    "args": [
      "published"
    ],
    "expected": false
  },
  {
    "name": "rejects archived",
    "args": [
      "archived"
    ],
    "expected": false,
    "hidden": true
  }
];
