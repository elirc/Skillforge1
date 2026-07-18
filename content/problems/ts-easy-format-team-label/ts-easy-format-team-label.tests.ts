import type { TestCase } from "@content/_authoring/types";

export const functionName = "formatTeamLabel";

export const tests: TestCase[] = [
  {
    "name": "formats a label",
    "args": [
      {
        "id": "a1",
        "label": "Alpha"
      }
    ],
    "expected": "Alpha (a1)"
  },
  {
    "name": "uses the provided id",
    "args": [
      {
        "id": "b2",
        "label": "Beta"
      }
    ],
    "expected": "Beta (b2)"
  },
  {
    "name": "keeps spaces in labels",
    "args": [
      {
        "id": "c3",
        "label": "Big Label"
      }
    ],
    "expected": "Big Label (c3)",
    "hidden": true
  }
];
