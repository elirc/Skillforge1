import type { TestCase } from "@content/_authoring/types";

export const functionName = "messagesToggleOpen";

export const tests: TestCase[] = [
  {
    "name": "opens closed state",
    "args": [
      false
    ],
    "expected": true
  },
  {
    "name": "closes open state",
    "args": [
      true
    ],
    "expected": false
  },
  {
    "name": "returns a boolean",
    "args": [
      false
    ],
    "expected": true,
    "hidden": true
  }
];
