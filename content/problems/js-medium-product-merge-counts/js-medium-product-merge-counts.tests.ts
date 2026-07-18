import type { TestCase } from "@content/_authoring/types";

export const functionName = "productMergeCounts";

export const tests: TestCase[] = [
  {
    "name": "adds overlapping keys",
    "args": [
      {
        "open": 2,
        "done": 1
      },
      {
        "open": 3,
        "blocked": 4
      }
    ],
    "expected": {
      "open": 5,
      "done": 1,
      "blocked": 4
    }
  },
  {
    "name": "handles empty left objects",
    "args": [
      {},
      {
        "a": 1
      }
    ],
    "expected": {
      "a": 1
    }
  },
  {
    "name": "handles empty right objects",
    "args": [
      {
        "a": 2
      },
      {}
    ],
    "expected": {
      "a": 2
    },
    "hidden": true
  }
];
