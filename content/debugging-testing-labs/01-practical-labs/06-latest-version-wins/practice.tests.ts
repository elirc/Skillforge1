export const functionName = "mergeVersion";
export const tests = [
  {
    "name": "reported defect",
    "args": [
      {
        "version": 2,
        "name": "new"
      },
      {
        "version": 1,
        "name": "old"
      }
    ],
    "expected": {
      "version": 2,
      "name": "new"
    },
    "hidden": false
  },
  {
    "name": "contract boundary 2",
    "args": [
      {
        "version": 2,
        "name": "keep"
      },
      {
        "version": 2,
        "name": "same-version"
      }
    ],
    "expected": {
      "version": 2,
      "name": "keep"
    },
    "hidden": false
  },
  {
    "name": "contract boundary 3",
    "args": [
      {
        "version": 1,
        "name": "old"
      },
      {
        "version": 3,
        "name": "new"
      }
    ],
    "expected": {
      "version": 3,
      "name": "new"
    },
    "hidden": true
  }
];
