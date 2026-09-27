export const functionName = "App";
export const tests = [
  {
    "name": "initial state",
    "args": [
      {
        "props": {},
        "actions": [],
        "assertions": [
          {
            "selector": "[role=status]",
            "text": "Choose a product"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "loads one record",
    "args": [
      {
        "props": {},
        "actions": [
          {
            "type": "click",
            "selector": "[data-id=B]"
          },
          {
            "type": "wait",
            "ms": 30
          }
        ],
        "assertions": [
          {
            "selector": "[role=status]",
            "text": "Beta"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "slower old response cannot win",
    "args": [
      {
        "props": {},
        "actions": [
          {
            "type": "click",
            "selector": "[data-id=A]"
          },
          {
            "type": "click",
            "selector": "[data-id=B]"
          },
          {
            "type": "wait",
            "ms": 120
          }
        ],
        "assertions": [
          {
            "selector": "[role=status]",
            "text": "Beta"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": true
  }
];
