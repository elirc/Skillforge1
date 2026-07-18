import type { TestCase } from "@content/_authoring/types";

export const functionName = "employeeValidationErrors";

export const tests: TestCase[] = [
  {
    "name": "returns no errors for valid input",
    "args": [
      {
        "name": "Alpha",
        "salary": 10
      }
    ],
    "expected": []
  },
  {
    "name": "reports both validation errors",
    "args": [
      {
        "name": " ",
        "salary": -1
      }
    ],
    "expected": [
      "name is required",
      "salary cannot be negative"
    ]
  },
  {
    "name": "reports amount errors only",
    "args": [
      {
        "name": "Alpha",
        "salary": -5
      }
    ],
    "expected": [
      "salary cannot be negative"
    ],
    "hidden": true
  }
];
