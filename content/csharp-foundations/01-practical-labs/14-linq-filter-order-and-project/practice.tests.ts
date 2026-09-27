export const functionName = "AvailableSkus";
export const tests = [
  {
    "name": "filtered and sorted",
    "args": [
      [
        {
          "Sku": "B",
          "Stock": 2
        },
        {
          "Sku": "A",
          "Stock": 1
        },
        {
          "Sku": "C",
          "Stock": 0
        }
      ]
    ],
    "expected": [
      "A",
      "B"
    ],
    "hidden": false
  },
  {
    "name": "empty",
    "args": [
      []
    ],
    "expected": [],
    "hidden": false
  },
  {
    "name": "negative not available",
    "args": [
      [
        {
          "Sku": "D",
          "Stock": -1
        }
      ]
    ],
    "expected": [],
    "hidden": true
  }
];
