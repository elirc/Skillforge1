import type { TestCase } from "@content/_authoring/types";

export const functionName = "formatUserLabel";

export const tests: TestCase[] = [
  {
    "name": "formats a user label",
    "args": [
      {
        "id": 1,
        "name": "Ada"
      }
    ],
    "expected": "Ada (#1)"
  },
  {
    "name": "uses the provided id",
    "args": [
      {
        "id": 42,
        "name": "Grace"
      }
    ],
    "expected": "Grace (#42)"
  },
  {
    "name": "keeps spaces in names",
    "args": [
      {
        "id": 7,
        "name": "Linus Torvalds"
      }
    ],
    "expected": "Linus Torvalds (#7)",
    "hidden": true
  }
];
