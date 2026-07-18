import type { TestCase } from "@content/_authoring/types";

export const functionName = "workspaceResultMessage";

export const tests: TestCase[] = [
  {
    "name": "returns success messages",
    "args": [
      {
        "ok": true,
        "message": "Saved"
      }
    ],
    "expected": "Saved"
  },
  {
    "name": "returns error messages",
    "args": [
      {
        "ok": false,
        "message": "Try again"
      }
    ],
    "expected": "Try again"
  },
  {
    "name": "does not inspect ok",
    "args": [
      {
        "ok": false,
        "message": "Nope"
      }
    ],
    "expected": "Nope",
    "hidden": true
  }
];
