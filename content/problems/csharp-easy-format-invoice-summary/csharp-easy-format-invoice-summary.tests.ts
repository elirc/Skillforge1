import type { TestCase } from "@content/_authoring/types";

export const functionName = "formatInvoiceSummary";

export const tests: TestCase[] = [
  {
    "name": "formats a summary",
    "args": [
      {
        "id": "1",
        "number": "Alpha"
      }
    ],
    "expected": "Alpha [1]"
  },
  {
    "name": "uses the provided id",
    "args": [
      {
        "id": "42",
        "number": "Beta"
      }
    ],
    "expected": "Beta [42]"
  },
  {
    "name": "keeps spaces in labels",
    "args": [
      {
        "id": "7",
        "number": "Long Name"
      }
    ],
    "expected": "Long Name [7]",
    "hidden": true
  }
];
