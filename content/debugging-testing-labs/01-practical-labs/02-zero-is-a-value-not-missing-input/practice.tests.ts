export const functionName = "quantity";
export const tests = [
  {
    "name": "reported defect",
    "args": [
      0
    ],
    "expected": 0,
    "hidden": false
  },
  {
    "name": "contract boundary 2",
    "args": [
      null
    ],
    "expected": 1,
    "hidden": false
  },
  {
    "name": "contract boundary 3",
    "args": [
      5
    ],
    "expected": 5,
    "hidden": true
  }
];
