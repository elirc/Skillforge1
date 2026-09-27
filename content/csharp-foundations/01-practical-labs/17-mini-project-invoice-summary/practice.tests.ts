export const functionName = "BuildInvoice";
export const tests = [
  {
    "name": "two lines",
    "args": [
      [
        {
          "UnitPrice": 2.5,
          "Quantity": 2
        },
        {
          "UnitPrice": 10,
          "Quantity": 1
        }
      ]
    ],
    "expected": {
      "Subtotal": 15,
      "Tax": 1.5,
      "Total": 16.5
    },
    "hidden": false
  },
  {
    "name": "empty invoice",
    "args": [
      []
    ],
    "expected": {
      "Subtotal": 0,
      "Tax": 0,
      "Total": 0
    },
    "hidden": false
  },
  {
    "name": "round midpoint",
    "args": [
      [
        {
          "UnitPrice": 0.05,
          "Quantity": 1
        }
      ]
    ],
    "expected": {
      "Subtotal": 0.05,
      "Tax": 0.01,
      "Total": 0.06
    },
    "hidden": true
  }
];
