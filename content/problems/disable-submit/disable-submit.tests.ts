import type { TestCase } from "@content/_authoring/types";

export const functionName = "disableSubmit";

export const tests: TestCase[] = [
  {
    "name": "enables valid idle forms",
    "args": [
      {
        "email": "a@b.com",
        "password": "secret"
      },
      false
    ],
    "expected": false
  },
  {
    "name": "disables while saving",
    "args": [
      {
        "email": "a@b.com",
        "password": "secret"
      },
      true
    ],
    "expected": true
  },
  {
    "name": "disables missing password",
    "args": [
      {
        "email": "a@b.com",
        "password": ""
      },
      false
    ],
    "expected": true,
    "hidden": true
  }
];
