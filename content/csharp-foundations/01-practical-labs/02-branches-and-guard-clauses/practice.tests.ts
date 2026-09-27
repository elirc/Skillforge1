export const functionName = "CanReserve";
export const tests = [
  {
    "name": "available",
    "args": [
      8,
      3
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "exact boundary",
    "args": [
      8,
      8
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "zero rejected",
    "args": [
      8,
      0
    ],
    "expected": false,
    "hidden": true
  },
  {
    "name": "oversold",
    "args": [
      8,
      9
    ],
    "expected": false,
    "hidden": true
  }
];
