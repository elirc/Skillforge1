import type { TestCase } from "@content/_authoring/types";

export const functionName = "maskEmail";

export const tests: TestCase[] = [
  {
    "name": "masks a normal email",
    "args": [
      "ada@example.com"
    ],
    "expected": "a***@example.com"
  },
  {
    "name": "keeps the domain",
    "args": [
      "person@sub.test.dev"
    ],
    "expected": "p***@sub.test.dev"
  },
  {
    "name": "works for short names",
    "args": [
      "x@example.com"
    ],
    "expected": "x***@example.com",
    "hidden": true
  }
];
