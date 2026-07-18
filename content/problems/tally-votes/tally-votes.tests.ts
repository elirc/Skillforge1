import type { TestCase } from "@content/_authoring/types";

export const functionName = "tallyVotes";

export const tests: TestCase[] = [
  {
    "name": "counts repeated votes",
    "args": [
      [
        "Ada",
        "Grace",
        "Ada"
      ]
    ],
    "expected": {
      "Ada": 2,
      "Grace": 1
    }
  },
  {
    "name": "handles no votes",
    "args": [
      []
    ],
    "expected": {}
  },
  {
    "name": "counts three candidates",
    "args": [
      [
        "A",
        "B",
        "C",
        "B"
      ]
    ],
    "expected": {
      "A": 1,
      "B": 2,
      "C": 1
    },
    "hidden": true
  }
];
