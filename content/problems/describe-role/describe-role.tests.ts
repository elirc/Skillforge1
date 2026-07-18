import type { TestCase } from "@content/_authoring/types";

export const functionName = "describeRole";

export const tests: TestCase[] = [
  {
    "name": "describes admins",
    "args": [
      "admin"
    ],
    "expected": "Administrator"
  },
  {
    "name": "describes editors",
    "args": [
      "editor"
    ],
    "expected": "Editor"
  },
  {
    "name": "describes viewers",
    "args": [
      "viewer"
    ],
    "expected": "Viewer",
    "hidden": true
  }
];
