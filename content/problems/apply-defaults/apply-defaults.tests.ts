import type { TestCase } from "@content/_authoring/types";

export const functionName = "applyDefaults";

export const tests: TestCase[] = [
  {
    "name": "applies partial config",
    "args": [
      {
        "retries": 3,
        "timeout": 1000,
        "verbose": false
      },
      {
        "timeout": 2000
      }
    ],
    "expected": {
      "retries": 3,
      "timeout": 2000,
      "verbose": false
    }
  },
  {
    "name": "keeps false overrides",
    "args": [
      {
        "retries": 3,
        "timeout": 1000,
        "verbose": true
      },
      {
        "verbose": false
      }
    ],
    "expected": {
      "retries": 3,
      "timeout": 1000,
      "verbose": false
    }
  },
  {
    "name": "keeps defaults when user config is empty",
    "args": [
      {
        "retries": 1,
        "timeout": 500,
        "verbose": false
      },
      {}
    ],
    "expected": {
      "retries": 1,
      "timeout": 500,
      "verbose": false
    },
    "hidden": true
  }
];
