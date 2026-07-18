import type { TestCase } from "@content/_authoring/types";

export const functionName = "sentenceStats";

export const tests: TestCase[] = [
  {
    "name": "counts words and characters",
    "args": [
      "hello world"
    ],
    "expected": {
      "words": 2,
      "characters": 10
    }
  },
  {
    "name": "ignores extra spaces for words",
    "args": [
      "  one   two  "
    ],
    "expected": {
      "words": 2,
      "characters": 6
    }
  },
  {
    "name": "handles empty text",
    "args": [
      "   "
    ],
    "expected": {
      "words": 0,
      "characters": 0
    },
    "hidden": true
  }
];
