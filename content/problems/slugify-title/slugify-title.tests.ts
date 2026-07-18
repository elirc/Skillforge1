import type { TestCase } from "@content/_authoring/types";

export const functionName = "slugifyTitle";

export const tests: TestCase[] = [
  {
    "name": "slugifies a normal title",
    "args": [
      "Hello World Today"
    ],
    "expected": "hello-world-today"
  },
  {
    "name": "removes punctuation",
    "args": [
      "Build, Test, Ship!"
    ],
    "expected": "build-test-ship"
  },
  {
    "name": "trims repeated spaces",
    "args": [
      "  TypeScript   Basics  "
    ],
    "expected": "typescript-basics",
    "hidden": true
  }
];
