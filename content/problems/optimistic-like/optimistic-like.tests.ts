import type { TestCase } from "@content/_authoring/types";

export const functionName = "optimisticLike";

export const tests: TestCase[] = [
  {
    "name": "likes an unliked post",
    "args": [
      {
        "id": "1",
        "liked": false,
        "likeCount": 10
      }
    ],
    "expected": {
      "id": "1",
      "liked": true,
      "likeCount": 11
    }
  },
  {
    "name": "unlikes a liked post",
    "args": [
      {
        "id": "1",
        "liked": true,
        "likeCount": 10
      }
    ],
    "expected": {
      "id": "1",
      "liked": false,
      "likeCount": 9
    }
  },
  {
    "name": "keeps other fields",
    "args": [
      {
        "id": "abc",
        "liked": false,
        "likeCount": 0
      }
    ],
    "expected": {
      "id": "abc",
      "liked": true,
      "likeCount": 1
    },
    "hidden": true
  }
];
