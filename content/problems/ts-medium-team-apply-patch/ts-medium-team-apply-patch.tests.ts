import type { TestCase } from "@content/_authoring/types";

export const functionName = "teamApplyPatch";

export const tests: TestCase[] = [
  {
    "name": "updates one field",
    "args": [
      {
        "id": "1",
        "label": "Old",
        "active": true
      },
      {
        "label": "New"
      }
    ],
    "expected": {
      "id": "1",
      "label": "New",
      "active": true
    }
  },
  {
    "name": "keeps false patch values",
    "args": [
      {
        "id": "1",
        "label": "Name",
        "active": true
      },
      {
        "active": false
      }
    ],
    "expected": {
      "id": "1",
      "label": "Name",
      "active": false
    }
  },
  {
    "name": "handles empty patches",
    "args": [
      {
        "id": "1",
        "label": "Name",
        "active": true
      },
      {}
    ],
    "expected": {
      "id": "1",
      "label": "Name",
      "active": true
    },
    "hidden": true
  }
];
