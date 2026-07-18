import type { TestCase } from "@content/_authoring/types";

export const functionName = "accountApplyPatch";

export const tests: TestCase[] = [
  {
    "name": "updates one field",
    "args": [
      {
        "id": "1",
        "displayName": "Old",
        "active": true
      },
      {
        "displayName": "New"
      }
    ],
    "expected": {
      "id": "1",
      "displayName": "New",
      "active": true
    }
  },
  {
    "name": "keeps false patch values",
    "args": [
      {
        "id": "1",
        "displayName": "Name",
        "active": true
      },
      {
        "active": false
      }
    ],
    "expected": {
      "id": "1",
      "displayName": "Name",
      "active": false
    }
  },
  {
    "name": "handles empty patches",
    "args": [
      {
        "id": "1",
        "displayName": "Name",
        "active": true
      },
      {}
    ],
    "expected": {
      "id": "1",
      "displayName": "Name",
      "active": true
    },
    "hidden": true
  }
];
