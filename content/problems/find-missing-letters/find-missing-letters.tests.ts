import type { TestCase } from "@content/_authoring/types";

export const functionName = "findMissingLetters";

export const tests: TestCase[] = [
  {
    "name": "finds missing letters",
    "args": [
      "abc xyz"
    ],
    "expected": "defghijklmnopqrstuvw"
  },
  {
    "name": "returns empty for pangrams",
    "args": [
      "the quick brown fox jumps over a lazy dog"
    ],
    "expected": ""
  },
  {
    "name": "ignores uppercase differences",
    "args": [
      "ABC"
    ],
    "expected": "defghijklmnopqrstuvwxyz",
    "hidden": true
  }
];
