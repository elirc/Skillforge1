export const functionName = "App";
export const tests = [
  {
    "name": "failure is visible",
    "args": [
      {
        "props": {},
        "actions": [
          {
            "type": "click",
            "selector": "button"
          },
          {
            "type": "wait",
            "ms": 40
          }
        ],
        "assertions": [
          {
            "selector": "[role=status]",
            "text": "Try again"
          },
          {
            "selector": "button",
            "disabled": false
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "retry succeeds",
    "args": [
      {
        "props": {},
        "actions": [
          {
            "type": "click",
            "selector": "button"
          },
          {
            "type": "wait",
            "ms": 40
          },
          {
            "type": "click",
            "selector": "button"
          },
          {
            "type": "wait",
            "ms": 40
          }
        ],
        "assertions": [
          {
            "selector": "[role=status]",
            "text": "Saved"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "initial ready",
    "args": [
      {
        "props": {},
        "actions": [],
        "assertions": [
          {
            "selector": "[role=status]",
            "text": "Ready"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": true
  }
];
