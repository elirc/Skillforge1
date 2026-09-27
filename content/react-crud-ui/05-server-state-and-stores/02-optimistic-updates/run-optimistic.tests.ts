import type { TestCase } from "@content/_authoring/types";

export const functionName = "runOptimistic";

const todos = [
  { id: 1, title: "Write tests", done: false },
  { id: 2, title: "Ship it", done: false },
];

const toggle1 = { type: "mutate", id: "m1", change: { op: "toggle", todoId: 1 } };
const rename2 = { type: "mutate", id: "m2", change: { op: "rename", todoId: 2, title: "Ship v2" } };

export const tests: TestCase[] = [
  {
    name: "the cache updates before the server answers",
    args: [todos, [toggle1]],
    expected: {
      cache: [
        { id: 1, title: "Write tests", done: true },
        { id: 2, title: "Ship it", done: false },
      ],
      server: todos,
      refetches: 0,
    },
  },
  {
    name: "success: server agrees, one refetch",
    args: [todos, [toggle1, { type: "settle", id: "m1", ok: true }]],
    expected: {
      cache: [
        { id: 1, title: "Write tests", done: true },
        { id: 2, title: "Ship it", done: false },
      ],
      server: [
        { id: 1, title: "Write tests", done: true },
        { id: 2, title: "Ship it", done: false },
      ],
      refetches: 1,
    },
  },
  {
    name: "failure: roll back, then refetch",
    args: [todos, [toggle1, { type: "settle", id: "m1", ok: false }]],
    expected: { cache: todos, server: todos, refetches: 1 },
  },
  {
    name: "optimistic delete",
    args: [todos, [{ type: "mutate", id: "d", change: { op: "delete", todoId: 2 } }]],
    expected: { cache: [{ id: 1, title: "Write tests", done: false }], server: todos, refetches: 0 },
  },
  {
    name: "two mutations in flight refetch once, after the last settles",
    args: [todos, [toggle1, rename2, { type: "settle", id: "m1", ok: true }, { type: "settle", id: "m2", ok: true }]],
    expected: {
      cache: [
        { id: 1, title: "Write tests", done: true },
        { id: 2, title: "Ship v2", done: false },
      ],
      server: [
        { id: 1, title: "Write tests", done: true },
        { id: 2, title: "Ship v2", done: false },
      ],
      refetches: 1,
    },
  },
  {
    name: "snapshot rollback also drops a later optimistic change until the refetch",
    args: [todos, [toggle1, rename2, { type: "settle", id: "m1", ok: false }]],
    expected: { cache: todos, server: todos, refetches: 0 },
  },
  {
    name: "the final refetch repairs the cache",
    args: [todos, [toggle1, rename2, { type: "settle", id: "m1", ok: false }, { type: "settle", id: "m2", ok: true }]],
    expected: {
      cache: [
        { id: 1, title: "Write tests", done: false },
        { id: 2, title: "Ship v2", done: false },
      ],
      server: [
        { id: 1, title: "Write tests", done: false },
        { id: 2, title: "Ship v2", done: false },
      ],
      refetches: 1,
    },
    hidden: true,
  },
  {
    name: "a duplicate settle is ignored",
    args: [todos, [toggle1, { type: "settle", id: "m1", ok: true }, { type: "settle", id: "m1", ok: false }]],
    expected: {
      cache: [
        { id: 1, title: "Write tests", done: true },
        { id: 2, title: "Ship it", done: false },
      ],
      server: [
        { id: 1, title: "Write tests", done: true },
        { id: 2, title: "Ship it", done: false },
      ],
      refetches: 1,
    },
    hidden: true,
  },
];
