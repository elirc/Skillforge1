import type { TestCase } from "@content/_authoring/types";

export const functionName = "omitKeys";

export const tests: TestCase[] = [
  {
    "name": "omits one key",
    "args": [
      {
        "id": 1,
        "password": "secret"
      },
      [
        "password"
      ]
    ],
    "expected": {
      "id": 1
    }
  },
  {
    "name": "omits multiple keys",
    "args": [
      {
        "a": 1,
        "b": 2,
        "c": 3
      },
      [
        "a",
        "c"
      ]
    ],
    "expected": {
      "b": 2
    }
  },
  {
    "name": "ignores missing keys",
    "args": [
      {
        "a": 1
      },
      [
        "x"
      ]
    ],
    "expected": {
      "a": 1
    },
    "hidden": true
  }
];
