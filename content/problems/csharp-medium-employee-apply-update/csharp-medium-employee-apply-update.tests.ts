import type { TestCase } from "@content/_authoring/types";

export const functionName = "employeeApplyUpdate";

export const tests: TestCase[] = [
  {
    "name": "updates one field",
    "args": [
      {
        "id": "1",
        "name": "Old",
        "isActive": true
      },
      {
        "name": "New"
      }
    ],
    "expected": {
      "id": "1",
      "name": "New",
      "isActive": true
    }
  },
  {
    "name": "keeps false updates",
    "args": [
      {
        "id": "1",
        "name": "Name",
        "isActive": true
      },
      {
        "isActive": false
      }
    ],
    "expected": {
      "id": "1",
      "name": "Name",
      "isActive": false
    }
  },
  {
    "name": "handles empty updates",
    "args": [
      {
        "id": "1",
        "name": "Name",
        "isActive": true
      },
      {}
    ],
    "expected": {
      "id": "1",
      "name": "Name",
      "isActive": true
    },
    "hidden": true
  }
];
