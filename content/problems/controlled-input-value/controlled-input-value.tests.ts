import type { TestCase } from "@content/_authoring/types";

export const functionName = "controlledInputValue";

export const tests: TestCase[] = [
  {
    "name": "keeps real values",
    "args": [
      "Ada"
    ],
    "expected": "Ada"
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
