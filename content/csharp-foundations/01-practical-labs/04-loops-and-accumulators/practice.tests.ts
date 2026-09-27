export const functionName = "SumPositive";
export const tests = [
  {
    "name": "mixed adjustments",
    "args": [
      [
        -2,
        4,
        3
      ]
    ],
    "expected": 7,
    "hidden": false
  },
  {
    "name": "empty",
    "args": [
      []
    ],
    "expected": 0,
    "hidden": false
  },
  {
    "name": "nonpositive",
    "args": [
      [
        0,
        -5
      ]
    ],
    "expected": 0,
    "hidden": true
  }
];
