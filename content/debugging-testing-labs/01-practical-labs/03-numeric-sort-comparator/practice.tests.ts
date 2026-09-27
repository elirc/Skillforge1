export const functionName = "sortScores";
export const tests = [
  {
    "name": "reported defect",
    "args": [
      [
        10,
        2,
        1
      ]
    ],
    "expected": [
      1,
      2,
      10
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
        -1,
        3,
        0
      ]
    ],
    "expected": [
      -1,
      0,
      3
    ],
    "hidden": true
  }
];
