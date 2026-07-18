import type { TestCase } from "@content/_authoring/types";

export const functionName = "makeLookup";

export const tests: TestCase[] = [
  {
    "name": "builds flag lookup",
    "args": [
      [
        {
          "key": "beta",
          "enabled": true
        },
        {
          "key": "ads",
          "enabled": false
        }
      ]
    ],
    "expected": {
      "beta": true,
      "ads": false
    }
  },
  {
    "name": "handles empty arrays",
    "args": [
      []
    ],
    "expected": {}
  },
  {
    "name": "last duplicate wins",
    "args": [
      [
        {
          "key": "x",
          "enabled": false
        },
        {
          "key": "x",
          "enabled": true
        }
      ]
    ],
    "expected": {
      "x": true
    },
    "hidden": true
  }
];
