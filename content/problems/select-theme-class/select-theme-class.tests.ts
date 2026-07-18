import type { TestCase } from "@content/_authoring/types";

export const functionName = "selectThemeClass";

export const tests: TestCase[] = [
  {
    "name": "returns dark class",
    "args": [
      "dark"
    ],
    "expected": "theme-dark"
  },
  {
    "name": "returns light class",
    "args": [
      "light"
    ],
    "expected": "theme-light"
  },
  {
    "name": "defaults to system",
    "args": [
      null
    ],
    "expected": "theme-system",
    "hidden": true
  }
];
