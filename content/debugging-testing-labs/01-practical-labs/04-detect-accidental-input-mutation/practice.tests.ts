export const functionName = "sortSnapshot";
export const tests = [
  {
    "name": "reported defect",
    "args": [
      [
        3,
        1
      ]
    ],
    "expected": {
      "sorted": [
        1,
        3
      ],
      "original": [
        3,
        1
      ]
    },
    "hidden": false
  },
  {
    "name": "contract boundary 2",
    "args": [
      []
    ],
    "expected": {
      "sorted": [],
      "original": []
    },
    "hidden": false
  },
  {
    "name": "contract boundary 3",
    "args": [
      [
        2,
        2,
        1
      ]
    ],
    "expected": {
      "sorted": [
        1,
        2,
        2
      ],
      "original": [
        2,
        2,
        1
      ]
    },
    "hidden": true
  }
];
