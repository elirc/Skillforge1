import type { TestCase } from "@content/_authoring/types";

export const functionName = "mergeSettings";

export const tests: TestCase[] = [
  {
    "name": "overrides matching keys",
    "args": [
      {
        "theme": "light",
        "density": "comfortable"
      },
      {
        "theme": "dark"
      }
    ],
    "expected": {
      "theme": "dark",
      "density": "comfortable"
    }
  },
  {
    "name": "adds new override keys",
    "args": [
      {
        "theme": "light"
      },
      {
        "beta": true
      }
    ],
    "expected": {
      "theme": "light",
      "beta": true
    }
  },
  {
    "name": "does not require overrides",
    "args": [
      {
        "pageSize": 20
      },
      {}
    ],
    "expected": {
      "pageSize": 20
    },
    "hidden": true
  }
];
