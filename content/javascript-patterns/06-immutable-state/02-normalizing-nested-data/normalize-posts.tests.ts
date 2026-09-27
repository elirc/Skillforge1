import type { TestCase } from "@content/_authoring/types";

export const functionName = "normalizePosts";

const ada = { id: 1, name: "Ada" };
const lin = { id: 2, name: "Lin" };

export const tests: TestCase[] = [
  {
    name: "a post without comments",
    args: [[{ id: 10, title: "Hello", author: ada, comments: [] }]],
    expected: {
      postIds: [10],
      posts: { 10: { id: 10, title: "Hello", author: 1, comments: [] } },
      comments: {},
      users: { 1: { id: 1, name: "Ada" } },
    },
  },
  {
    name: "shared users are stored once",
    args: [
      [
        { id: 10, title: "Hello", author: ada, comments: [{ id: 100, text: "Nice", author: lin }] },
        { id: 11, title: "Again", author: lin, comments: [{ id: 101, text: "Thanks", author: ada }, { id: 102, text: "+1", author: lin }] },
      ],
    ],
    expected: {
      postIds: [10, 11],
      posts: {
        10: { id: 10, title: "Hello", author: 1, comments: [100] },
        11: { id: 11, title: "Again", author: 2, comments: [101, 102] },
      },
      comments: {
        100: { id: 100, text: "Nice", author: 2 },
        101: { id: 101, text: "Thanks", author: 1 },
        102: { id: 102, text: "+1", author: 2 },
      },
      users: { 1: { id: 1, name: "Ada" }, 2: { id: 2, name: "Lin" } },
    },
  },
  { name: "no posts", args: [[]], expected: { postIds: [], posts: {}, comments: {}, users: {} }, hidden: true },
];
