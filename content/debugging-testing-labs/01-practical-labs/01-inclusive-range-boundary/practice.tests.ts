export const functionName = "range";
export const tests = [
  {
    "name": "reported defect",
    "args": [
      3
    ],
    "expected": [
      0,
      1,
      2,
      3
    ],
    "hidden": false
  },
  {
    "name": "contract boundary 2",
    "args": [
      0
    ],
    "expected": [
      0
    ],
    "hidden": false
  },
  {
    "name": "contract boundary 3",
    "args": [
      -1
    ],
    "expected": [],
    "hidden": true
  }
];
