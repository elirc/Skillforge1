import type { TestCase } from "@content/_authoring/types";

export const functionName = "workspaceApplyPatch";

export const tests: TestCase[] = [
  {
    "name": "updates one field",
    "args": [
      {
        "id": "1",
        "name": "Old",
        "active": true
      },
      {
        "name": "New"
      }
    ],
    "expected": {
      "id": "1",
      "name": "New",
      "active": true
    }
  },
  {
    "name": "keeps false patch values",
    "args": [
      {
        "id": "1",
        "name": "Name",
        "active": true
      },
      {
        "active": false
      }
    ],
    "expected": {
      "id": "1",
      "name": "Name",
      "active": false
    }
  },
  {
    "name": "handles empty patches",
    "args": [
      {
        "id": "1",
        "name": "Name",
        "active": true
      },
      {}
    ],
    "expected": {
      "id": "1",
      "name": "Name",
      "active": true
    },
    "hidden": true
  }
];
