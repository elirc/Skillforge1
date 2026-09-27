export const functionName = "App";
export const tests = [
  {
    "name": "default page",
    "args": [
      {
        "props": {},
        "actions": [],
        "assertions": [
          {
            "selector": "output",
            "text": "Page 1"
          },
          {
            "selector": "a",
            "attribute": "href",
            "equals": "?page=2"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "preserves filter",
    "args": [
      {
        "props": {
          "initialSearch": "?q=pen&page=3"
        },
        "actions": [],
        "assertions": [
          {
            "selector": "output",
            "text": "Page 3"
          },
          {
            "selector": "a",
            "attribute": "href",
            "equals": "?q=pen&page=4"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "invalid page",
    "args": [
      {
        "props": {
          "initialSearch": "?page=-5"
        },
        "actions": [],
        "assertions": [
          {
            "selector": "output",
            "text": "Page 1"
          },
          {
            "selector": "a",
            "attribute": "href",
            "equals": "?page=2"
          }
        ]
      }
    ],
    "expected": true,
    "hidden": true
  }
];
