import type { TestCase } from "@content/_authoring/types";

export const functionName = "settingsOptimisticCount";

export const tests: TestCase[] = [
  {
    "name": "increments when selecting",
    "args": [
      {
        "id": "1",
        "selected": false,
        "selectedCount": 4
      }
    ],
    "expected": {
      "id": "1",
      "selected": true,
      "selectedCount": 5
    }
  },
  {
    "name": "decrements when unselecting",
    "args": [
      {
        "id": "1",
        "selected": true,
        "selectedCount": 4
      }
    ],
    "expected": {
      "id": "1",
      "selected": false,
      "selectedCount": 3
    }
  },
  {
    "name": "keeps ids",
    "args": [
      {
        "id": "x",
        "selected": false,
        "selectedCount": 0
      }
    ],
    "expected": {
      "id": "x",
      "selected": true,
      "selectedCount": 1
    },
    "hidden": true
  }
];
