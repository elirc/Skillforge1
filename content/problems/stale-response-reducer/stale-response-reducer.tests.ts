import type { TestCase } from "@content/_authoring/types";

export const functionName = "replayRequests";

export const tests: TestCase[] = [
  {
    name: "a request followed by its response",
    args: [
      [
        { type: "request", key: "products", requestId: "r1" },
        { type: "success", key: "products", requestId: "r1", data: [1, 2] },
      ],
    ],
    expected: {
      state: { products: { status: "success", data: [1, 2], error: null, requestId: "r1" } },
      ignored: 0,
    },
  },
  {
    name: "an out-of-order older response is ignored",
    args: [
      [
        { type: "request", key: "search", requestId: "ca" },
        { type: "request", key: "search", requestId: "cat" },
        { type: "success", key: "search", requestId: "cat", data: ["cat"] },
        { type: "success", key: "search", requestId: "ca", data: ["car", "cat"] },
      ],
    ],
    expected: {
      state: { search: { status: "success", data: ["cat"], error: null, requestId: "cat" } },
      ignored: 1,
    },
  },
  {
    name: "keeps old data while refetching",
    args: [
      [
        { type: "request", key: "user", requestId: "r1" },
        { type: "success", key: "user", requestId: "r1", data: "v1" },
        { type: "request", key: "user", requestId: "r2" },
      ],
    ],
    expected: {
      state: { user: { status: "loading", data: "v1", error: null, requestId: "r2" } },
      ignored: 0,
    },
  },
  {
    name: "a failure keeps the previous data",
    args: [
      [
        { type: "request", key: "user", requestId: "r1" },
        { type: "success", key: "user", requestId: "r1", data: "v1" },
        { type: "request", key: "user", requestId: "r2" },
        { type: "failure", key: "user", requestId: "r2", error: "timeout" },
      ],
    ],
    expected: {
      state: { user: { status: "error", data: "v1", error: "timeout", requestId: "r2" } },
      ignored: 0,
    },
  },
  {
    name: "a cancelled request ignores its late response",
    args: [
      [
        { type: "request", key: "orders", requestId: "r1" },
        { type: "cancel", key: "orders" },
        { type: "success", key: "orders", requestId: "r1", data: [] },
      ],
    ],
    expected: {
      state: { orders: { status: "idle", data: null, error: null, requestId: null } },
      ignored: 1,
    },
  },
  {
    name: "keys are independent and keep first-requested order",
    args: [
      [
        { type: "request", key: "b", requestId: "1" },
        { type: "request", key: "a", requestId: "1" },
        { type: "success", key: "a", requestId: "1", data: "A" },
        { type: "failure", key: "b", requestId: "1", error: "500" },
      ],
    ],
    expected: {
      state: {
        b: { status: "error", data: null, error: "500", requestId: "1" },
        a: { status: "success", data: "A", error: null, requestId: "1" },
      },
      ignored: 0,
    },
  },
  {
    name: "responses for unknown keys are ignored without creating entries",
    args: [[{ type: "success", key: "ghost", requestId: "r1", data: 1 }, { type: "cancel", key: "ghost" }]],
    expected: { state: {}, ignored: 1 },
    hidden: true,
  },
  {
    name: "a duplicate delivery after settling is ignored",
    args: [
      [
        { type: "request", key: "k", requestId: "r1" },
        { type: "success", key: "k", requestId: "r1", data: "first" },
        { type: "success", key: "k", requestId: "r1", data: "second" },
      ],
    ],
    expected: {
      state: { k: { status: "success", data: "first", error: null, requestId: "r1" } },
      ignored: 1,
    },
    hidden: true,
  },
  {
    name: "cancelling a refetch falls back to the cached data",
    args: [
      [
        { type: "request", key: "k", requestId: "r1" },
        { type: "failure", key: "k", requestId: "r1", error: "boom" },
        { type: "request", key: "k", requestId: "r2" },
        { type: "success", key: "k", requestId: "r2", data: "ok" },
        { type: "request", key: "k", requestId: "r3" },
        { type: "cancel", key: "k" },
      ],
    ],
    expected: {
      state: { k: { status: "success", data: "ok", error: null, requestId: null } },
      ignored: 0,
    },
    hidden: true,
  },
];
