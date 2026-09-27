export const functionName = "App";
export const tests = [
  {
    "name": "filters case-insensitively",
    "args": [
      {
        "props": {
          "products": [
            {
              "id": 1,
              "name": "Blue Mug"
            },
            {
              "id": 2,
              "name": "Pen"
            }
          ]
        },
        "actions": [
          {
            "type": "input",
            "selector": "input",
            "value": " mug "
          }
        ],
        "assertions": [
          {
            "selector": "li",
            "count": 1,
            "text": "Blue Mug"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "empty result",
    "args": [
      {
        "props": {
          "products": [
            {
              "id": 1,
              "name": "Pen"
            }
          ]
        },
        "actions": [
          {
            "type": "input",
            "selector": "input",
            "value": "none"
          }
        ],
        "assertions": [
          {
            "selector": "li",
            "count": 0
          },
          {
            "selector": "[role=status]",
            "text": "No matches"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "empty catalog",
    "args": [
      {
        "props": {},
        "actions": [],
        "assertions": [
          {
            "selector": "[role=status]",
            "text": "No matches"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": true
  }
];
