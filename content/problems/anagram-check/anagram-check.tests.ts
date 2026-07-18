import type { TestCase } from "@content/_authoring/types";

export const functionName = "anagramCheck";

export const tests: TestCase[] = [
  {
    "name": "detects anagrams",
    "args": [
      "listen",
      "silent"
    ],
    "expected": true
  },
  {
    "name": "rejects different letters",
    "args": [
      "apple",
      "apply"
    ],
    "expected": false
  },
  {
    "name": "rejects different lengths",
    "args": [
      "rat",
      "tarp"
    ],
    "expected": false,
    "hidden": true
  }
];
