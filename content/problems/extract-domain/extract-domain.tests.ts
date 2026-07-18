import type { TestCase } from "@content/_authoring/types";

export const functionName = "extractDomain";

export const tests: TestCase[] = [
  {
    "name": "extracts https domains",
    "args": [
      "https://example.com/posts/1"
    ],
    "expected": "example.com"
  },
  {
    "name": "extracts http domains",
    "args": [
      "http://localhost:3000/path"
    ],
    "expected": "localhost:3000"
  },
  {
    "name": "handles URLs without protocol",
    "args": [
      "docs.example.com/start"
    ],
    "expected": "docs.example.com",
    "hidden": true
  }
];
