import type { TestCase } from "@content/_authoring/types";

export const functionName = "buildQueryString";

export const tests: TestCase[] = [
  {
    "name": "sorts keys and joins values",
    "args": [
      {
        "page": 2,
        "q": "react"
      }
    ],
    "expected": "page=2&q=react"
  },
  {
    "name": "skips undefined values",
    "args": [
      {
        "q": "js"
      }
    ],
    "expected": "q=js"
  },
  {
    "name": "encodes spaces",
    "args": [
      {
        "q": "hello world"
      }
    ],
    "expected": "q=hello%20world",
    "hidden": true
  }
];
