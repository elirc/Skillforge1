export const functionName = "App";
export const tests = [
  {
    "name": "starts invalid",
    "args": [
      {
        "props": {},
        "actions": [],
        "assertions": [
          {
            "selector": "button",
            "disabled": true
          },
          {
            "selector": "[role=status]",
            "text": "Name is required"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "valid name enables save",
    "args": [
      {
        "props": {},
        "actions": [
          {
            "type": "input",
            "selector": "input",
            "value": "Ada"
          }
        ],
        "assertions": [
          {
            "selector": "button",
            "disabled": false
          },
          {
            "selector": "input",
            "value": "Ada"
          },
          {
            "selector": "label",
            "attribute": "for",
            "equals": "name"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "spaces are invalid",
    "args": [
      {
        "props": {},
        "actions": [
          {
            "type": "input",
            "selector": "input",
            "value": "   "
          }
        ],
        "assertions": [
          {
            "selector": "button",
            "disabled": true
          }
        ]
      }
    ],
    "expected": true,
    "hidden": true
  }
];
