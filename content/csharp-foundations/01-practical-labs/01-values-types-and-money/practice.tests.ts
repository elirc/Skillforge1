export const functionName = "Total";
export const tests = [
  {
    "name": "three notebooks",
    "args": [
      2.5,
      3
    ],
    "expected": 7.5,
    "hidden": false
  },
  {
    "name": "no items",
    "args": [
      9,
      0
    ],
    "expected": 0,
    "hidden": false
  },
  {
    "name": "decimal cents",
    "args": [
      0.1,
      3
    ],
    "expected": 0.3,
    "hidden": true
  }
];
