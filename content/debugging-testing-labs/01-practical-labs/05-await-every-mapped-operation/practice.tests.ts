export const functionName = "doubleAll";
export const tests = [
  {
    "name": "reported defect",
    "args": [
      [
        2,
        3
      ]
    ],
    "expected": [
      4,
      6
    ],
    "hidden": false
  },
  {
    "name": "contract boundary 2",
    "args": [
      []
    ],
    "expected": [],
    "hidden": false
  },
  {
    "name": "contract boundary 3",
    "args": [
      [
        0,
        -2
      ]
    ],
    "expected": [
      0,
      -4
    ],
    "hidden": true
  }
];
