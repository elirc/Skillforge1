import type { TestCase } from "@content/_authoring/types";

export const functionName = "orderApplyUpdate";

export const tests: TestCase[] = [
  {
    "name": "updates one field",
    "args": [
      {
        "id": "1",
        "number": "Old",
        "isActive": true
      },
      {
        "number": "New"
      }
    ],
    "expected": {
      "id": "1",
      "number": "New",
      "isActive": true
    }
  },
  {
    "name": "keeps false updates",
    "args": [
      {
        "id": "1",
        "number": "Name",
        "isActive": true
      },
      {
        "isActive": false
      }
    ],
    "expected": {
      "id": "1",
      "number": "Name",
      "isActive": false
    }
  },
  {
    "name": "handles empty updates",
    "args": [
      {
        "id": "1",
        "number": "Name",
        "isActive": true
      },
      {}
    ],
    "expected": {
      "id": "1",
      "number": "Name",
      "isActive": true
    },
    "hidden": true
  }
];
