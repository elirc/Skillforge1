import type { TestCase } from "@content/_authoring/types";

export const functionName = "displayNameFallback";

export const tests: TestCase[] = [
  {
    "name": "uses first and last name",
    "args": [
      {
        "firstName": "Ada",
        "lastName": "Lovelace",
        "username": "ada"
      }
    ],
    "expected": "Ada Lovelace"
  },
  {
    "name": "falls back to username",
    "args": [
      {
        "firstName": "Ada",
        "username": "ada"
      }
    ],
    "expected": "ada"
  },
  {
    "name": "falls back when names are missing",
    "args": [
      {
        "username": "ghost-user"
      }
    ],
    "expected": "ghost-user",
    "hidden": true
  }
];
