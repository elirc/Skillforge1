export const functionName = "Adjust";
export const tests = [
  {
    "name": "receive",
    "args": [
      5,
      3
    ],
    "expected": {
      "Accepted": true,
      "Stock": 8,
      "Reason": "ok"
    },
    "hidden": false
  },
  {
    "name": "reject oversell",
    "args": [
      5,
      -6
    ],
    "expected": {
      "Accepted": false,
      "Stock": 5,
      "Reason": "out-of-range"
    },
    "hidden": false
  },
  {
    "name": "integer overflow",
    "args": [
      2147483647,
      1
    ],
    "expected": {
      "Accepted": false,
      "Stock": 2147483647,
      "Reason": "out-of-range"
    },
    "hidden": true
  },
  {
    "name": "consume all",
    "args": [
      5,
      -5
    ],
    "expected": {
      "Accepted": true,
      "Stock": 0,
      "Reason": "ok"
    },
    "hidden": true
  }
];
