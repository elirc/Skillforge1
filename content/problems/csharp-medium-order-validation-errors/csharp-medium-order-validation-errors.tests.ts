import type { TestCase } from "@content/_authoring/types";

export const functionName = "orderValidationErrors";

export const tests: TestCase[] = [
  {
    "name": "returns no errors for valid input",
    "args": [
      {
        "number": "Alpha",
        "total": 10
      }
    ],
    "expected": []
  },
  {
    "name": "reports both validation errors",
    "args": [
      {
        "number": " ",
        "total": -1
      }
    ],
    "expected": [
      "number is required",
      "total cannot be negative"
    ]
  },
  {
    "name": "reports amount errors only",
    "args": [
      {
        "number": "Alpha",
        "total": -5
      }
    ],
    "expected": [
      "total cannot be negative"
    ],
    "hidden": true
  }
];
