export const functionName = "total";
export const tests = [
  {
    "name": "reported defect",
    "args": [
      []
    ],
    "expected": 0,
    "hidden": false
  },
  {
    "name": "contract boundary 2",
    "args": [
      [
        2,
        3
      ]
    ],
    "expected": 5,
    "hidden": false
  },
  {
    "name": "contract boundary 3",
    "args": [
      [
        -2,
        2
      ]
    ],
    "expected": 0,
    "hidden": true
  }
];
