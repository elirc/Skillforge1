import type { TestCase } from "@content/_authoring/types";

export const functionName = "profileReducer";

export const tests: TestCase[] = [
  {
    "name": "increments",
    "args": [
      2,
      {
        "type": "increment"
      }
    ],
    "expected": 3
  },
  {
    "name": "decrements",
    "args": [
      2,
      {
        "type": "decrement"
      }
    ],
    "expected": 1
  },
  {
    "name": "resets",
    "args": [
      9,
      {
        "type": "reset"
      }
    ],
    "expected": 0,
    "hidden": true
  }
];
