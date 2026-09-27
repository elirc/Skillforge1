export const functionName = "Totals";
export const tests = [
  {
    "name": "net movements",
    "args": [
      [
        {
          "Sku": "A",
          "Delta": 4
        },
        {
          "Sku": "B",
          "Delta": 2
        },
        {
          "Sku": "A",
          "Delta": -1
        }
      ]
    ],
    "expected": {
      "A": 3,
      "B": 2
    },
    "hidden": false
  },
  {
    "name": "empty",
    "args": [
      []
    ],
    "expected": {},
    "hidden": false
  },
  {
    "name": "zero net",
    "args": [
      [
        {
          "Sku": "X",
          "Delta": 1
        },
        {
          "Sku": "X",
          "Delta": -1
        }
      ]
    ],
    "expected": {
      "X": 0
    },
    "hidden": true
  }
];
