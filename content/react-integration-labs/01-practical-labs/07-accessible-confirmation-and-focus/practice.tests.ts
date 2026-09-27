export const functionName = "App";
export const tests = [
  {
    "name": "opens labelled confirmation",
    "args": [
      {
        "props": {},
        "actions": [
          {
            "type": "click",
            "selector": "button"
          }
        ],
        "assertions": [
          {
            "selector": "[role=dialog]",
            "count": 1,
            "attribute": "aria-labelledby",
            "equals": "confirm-title"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "cancel preserves product",
    "args": [
      {
        "props": {},
        "actions": [
          {
            "type": "click",
            "selector": "button"
          },
          {
            "type": "click",
            "selector": "[role=dialog] button"
          }
        ],
        "assertions": [
          {
            "selector": "[role=dialog]",
            "count": 0
          },
          {
            "selector": "[role=status]",
            "count": 0
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "confirm deletes",
    "args": [
      {
        "props": {},
        "actions": [
          {
            "type": "click",
            "selector": "button"
          },
          {
            "type": "click",
            "selector": "[data-action=confirm]"
          }
        ],
        "assertions": [
          {
            "selector": "[role=status]",
            "text": "Deleted"
          },
          {
            "selector": "[role=dialog]",
            "count": 0
          }
        ]
      }
    ],
    "expected": true,
    "hidden": true
  }
];
