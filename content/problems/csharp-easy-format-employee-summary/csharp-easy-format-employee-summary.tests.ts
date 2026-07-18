import type { TestCase } from "@content/_authoring/types";

export const functionName = "formatEmployeeSummary";

export const tests: TestCase[] = [
  {
    "name": "formats a summary",
    "args": [
      {
        "id": "1",
        "name": "Alpha"
      }
    ],
    "expected": "Alpha [1]"
  },
  {
    "name": "uses the provided id",
    "args": [
      {
        "id": "42",
        "name": "Beta"
      }
    ],
    "expected": "Beta [42]"
  },
  {
    "name": "keeps spaces in labels",
    "args": [
      {
        "id": "7",
        "name": "Long Name"
      }
    ],
    "expected": "Long Name [7]",
    "hidden": true
  }
];
