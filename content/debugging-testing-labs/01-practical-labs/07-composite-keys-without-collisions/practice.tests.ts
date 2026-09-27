export const functionName = "countPairs";
export const tests = [
  {
    "name": "reported defect",
    "args": [
      [
        [
          "ab",
          "c"
        ],
        [
          "a",
          "bc"
        ]
      ]
    ],
    "expected": 2,
    "hidden": false
  },
  {
    "name": "contract boundary 2",
    "args": [
      [
        [
          "x",
          "y"
        ],
        [
          "x",
          "y"
        ]
      ]
    ],
    "expected": 1,
    "hidden": false
  },
  {
    "name": "contract boundary 3",
    "args": [
      []
    ],
    "expected": 0,
    "hidden": true
  }
];
