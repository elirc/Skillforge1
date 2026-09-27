export const functionName = "App";
export const tests = [
  {
    "name": "reserves one",
    "args": [
      {
        "props": {
          "initial": [
            {
              "sku": "BOOK",
              "stock": 2
            },
            {
              "sku": "MUG",
              "stock": 0
            }
          ]
        },
        "actions": [
          {
            "type": "click",
            "selector": "[data-sku=BOOK] button"
          }
        ],
        "assertions": [
          {
            "selector": "[data-sku=BOOK] span",
            "text": "BOOK: 1"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "stops at zero",
    "args": [
      {
        "props": {
          "initial": [
            {
              "sku": "BOOK",
              "stock": 1
            }
          ]
        },
        "actions": [
          {
            "type": "click",
            "selector": "button"
          },
          {
            "type": "click",
            "selector": "button"
          }
        ],
        "assertions": [
          {
            "selector": "span",
            "text": "BOOK: 0"
          },
          {
            "selector": "button",
            "disabled": true
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "filter retains stock edit",
    "args": [
      {
        "props": {
          "initial": [
            {
              "sku": "BOOK",
              "stock": 2
            },
            {
              "sku": "MUG",
              "stock": 5
            }
          ]
        },
        "actions": [
          {
            "type": "click",
            "selector": "[data-sku=BOOK] button"
          },
          {
            "type": "input",
            "selector": "input",
            "value": "book"
          }
        ],
        "assertions": [
          {
            "selector": "li",
            "count": 1
          },
          {
            "selector": "span",
            "text": "BOOK: 1"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": true
  }
];
