import type { TestCase } from "@content/_authoring/types";

export const functionName = "repeatString";

export const tests: TestCase[] = [
  {
    "name": "repeats text three times",
    "args": [
      "ha",
      3
    ],
    "expected": "hahaha"
  },
  {
    "name": "returns empty for zero",
    "args": [
      "x",
      0
    ],
    "expected": ""
  },
  {
    "name": "repeats whole words",
    "args": [
      "go ",
      2
    ],
    "expected": "go go ",
    "hidden": true
  }
];
