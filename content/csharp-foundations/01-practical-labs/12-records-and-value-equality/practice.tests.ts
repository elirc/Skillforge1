export const functionName = "SameProduct";
export const tests = [
  {
    "name": "same values",
    "args": [
      {
        "Sku": "A",
        "Price": 2
      },
      {
        "Sku": "A",
        "Price": 2
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "changed price",
    "args": [
      {
        "Sku": "A",
        "Price": 2
      },
      {
        "Sku": "A",
        "Price": 3
      }
    ],
    "expected": false,
    "hidden": false
  },
  {
    "name": "changed key",
    "args": [
      {
        "Sku": "A",
        "Price": 2
      },
      {
        "Sku": "B",
        "Price": 2
      }
    ],
    "expected": false,
    "hidden": true
  }
];
