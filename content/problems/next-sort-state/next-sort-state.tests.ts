import type { TestCase } from "@content/_authoring/types";

export const functionName = "nextSortState";

export const tests: TestCase[] = [
  {
    "name": "none becomes ascending",
    "args": [
      "none"
    ],
    "expected": "asc"
  },
  {
    "name": "ascending becomes descending",
    "args": [
      "asc"
    ],
    "expected": "desc"
  },
  {
    "name": "descending clears sorting",
    "args": [
      "desc"
    ],
    "expected": "none",
    "hidden": true
  }
];
