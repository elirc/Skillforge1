import type { TestCase } from "@content/_authoring/types";

export const functionName = "parseStatusMessage";

export const tests: TestCase[] = [
  {
    "name": "reads success messages",
    "args": [
      {
        "status": "success",
        "message": "Saved"
      }
    ],
    "expected": "Saved"
  },
  {
    "name": "reads error messages",
    "args": [
      {
        "status": "error",
        "error": "Try again"
      }
    ],
    "expected": "Try again"
  },
  {
    "name": "does not confuse fields",
    "args": [
      {
        "status": "success",
        "message": "Ready"
      }
    ],
    "expected": "Ready",
    "hidden": true
  }
];
