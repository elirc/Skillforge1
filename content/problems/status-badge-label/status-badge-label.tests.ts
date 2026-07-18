import type { TestCase } from "@content/_authoring/types";

export const functionName = "statusBadgeLabel";

export const tests: TestCase[] = [
  {
    "name": "labels idle",
    "args": [
      "idle"
    ],
    "expected": "Ready"
  },
  {
    "name": "labels loading",
    "args": [
      "loading"
    ],
    "expected": "Loading..."
  },
  {
    "name": "labels errors",
    "args": [
      "error"
    ],
    "expected": "Needs attention",
    "hidden": true
  }
];
