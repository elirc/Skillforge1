export const functionName = "App";
export const tests = [
  {
    "name": "two queued increments",
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
            "selector": "output",
            "text": "2"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "repeated clicks",
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
            "selector": "button"
          }
        ],
        "assertions": [
          {
            "selector": "output",
            "text": "4"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "uses initial prop",
    "args": [
      {
        "props": {
          "initial": -1
        },
        "actions": [
          {
            "type": "click",
            "selector": "button"
          }
        ],
        "assertions": [
          {
            "selector": "output",
            "text": "1"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": true
  }
];
