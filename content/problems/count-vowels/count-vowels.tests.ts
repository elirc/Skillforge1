import type { TestCase } from "@content/_authoring/types";

export const functionName = "countVowels";

export const tests: TestCase[] = [
  {
    "name": "counts lowercase vowels",
    "args": [
      "education"
    ],
    "expected": 5
  },
  {
    "name": "ignores consonants",
    "args": [
      "rhythm"
    ],
    "expected": 0
  },
  {
    "name": "ignores case",
    "args": [
      "Hello WORLD"
    ],
    "expected": 3,
    "hidden": true
  }
];
