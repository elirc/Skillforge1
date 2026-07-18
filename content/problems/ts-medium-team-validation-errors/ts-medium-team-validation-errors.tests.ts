import type { TestCase } from "@content/_authoring/types";

export const functionName = "teamValidationErrors";

export const tests: TestCase[] = [
  {
    "name": "returns no errors for valid input",
    "args": [
      {
        "name": "Alpha",
        "tags": [
          "one"
        ]
      }
    ],
    "expected": []
  },
  {
    "name": "reports both errors",
    "args": [
      {
        "name": " ",
        "tags": []
      }
    ],
    "expected": [
      "Name is required",
      "Choose at least one tag"
    ]
  },
  {
    "name": "reports tag errors only",
    "args": [
      {
        "name": "Alpha",
        "tags": []
      }
    ],
    "expected": [
      "Choose at least one tag"
    ],
    "hidden": true
  }
];
