import type { TestCase } from "@content/_authoring/types";

export const functionName = "projectApplyPatch";

export const tests: TestCase[] = [
  {
    "name": "updates one field",
    "args": [
      {
        "id": "1",
        "title": "Old",
        "active": true
      },
      {
        "title": "New"
      }
    ],
    "expected": {
      "id": "1",
      "title": "New",
      "active": true
    }
  },
  {
    "name": "keeps false patch values",
    "args": [
      {
        "id": "1",
        "title": "Name",
        "active": true
      },
      {
        "active": false
      }
    ],
    "expected": {
      "id": "1",
      "title": "Name",
      "active": false
    }
  },
  {
    "name": "handles empty patches",
    "args": [
      {
        "id": "1",
        "title": "Name",
        "active": true
      },
      {}
    ],
    "expected": {
      "id": "1",
      "title": "Name",
      "active": true
    },
    "hidden": true
  }
];
