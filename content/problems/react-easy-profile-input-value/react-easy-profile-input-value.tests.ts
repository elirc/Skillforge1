import type { TestCase } from "@content/_authoring/types";

export const functionName = "profileInputValue";

export const tests: TestCase[] = [
  {
    "name": "keeps real values",
    "args": [
      "hello"
    ],
    "expected": "hello"
  },
  {
    "name": "converts null to empty string",
    "args": [
      null
    ],
    "expected": ""
  },
  {
    "name": "keeps empty strings",
    "args": [
      ""
    ],
    "expected": "",
    "hidden": true
  }
];
