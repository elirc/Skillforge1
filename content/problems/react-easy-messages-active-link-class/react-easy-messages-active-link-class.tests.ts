import type { TestCase } from "@content/_authoring/types";

export const functionName = "messagesActiveLinkClass";

export const tests: TestCase[] = [
  {
    "name": "marks exact matches active",
    "args": [
      "/home",
      "/home"
    ],
    "expected": "link active"
  },
  {
    "name": "leaves other links inactive",
    "args": [
      "/settings",
      "/home"
    ],
    "expected": "link"
  },
  {
    "name": "requires exact match",
    "args": [
      "/home",
      "/home/profile"
    ],
    "expected": "link",
    "hidden": true
  }
];
