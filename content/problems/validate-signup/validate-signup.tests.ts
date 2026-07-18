import type { TestCase } from "@content/_authoring/types";

export const functionName = "validateSignup";

export const tests: TestCase[] = [
  {
    "name": "returns no errors for valid input",
    "args": [
      {
        "email": "ada@example.com",
        "password": "longpass"
      }
    ],
    "expected": []
  },
  {
    "name": "reports both errors",
    "args": [
      {
        "email": "bad-email",
        "password": "short"
      }
    ],
    "expected": [
      "Email must contain @",
      "Password must be at least 8 characters"
    ]
  },
  {
    "name": "reports one error",
    "args": [
      {
        "email": "ok@example.com",
        "password": "tiny"
      }
    ],
    "expected": [
      "Password must be at least 8 characters"
    ],
    "hidden": true
  }
];
