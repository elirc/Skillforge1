import type { TestCase } from "@content/_authoring/types";

export const functionName = "modalTitle";

export const tests: TestCase[] = [
  {
    "name": "labels create mode",
    "args": [
      "create"
    ],
    "expected": "Create item"
  },
  {
    "name": "labels edit mode",
    "args": [
      "edit"
    ],
    "expected": "Edit item"
  },
  {
    "name": "returns exact text",
    "args": [
      "create"
    ],
    "expected": "Create item",
    "hidden": true
  }
];
