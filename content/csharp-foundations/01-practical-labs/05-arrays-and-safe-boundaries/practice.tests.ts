export const functionName = "LastOrDefault";
export const tests = [
  {
    "name": "several",
    "args": [
      [
        "a",
        "b"
      ]
    ],
    "expected": "b",
    "hidden": false
  },
  {
    "name": "empty",
    "args": [
      []
    ],
    "expected": "none",
    "hidden": false
  },
  {
    "name": "single",
    "args": [
      [
        "only"
      ]
    ],
    "expected": "only",
    "hidden": true
  }
];
