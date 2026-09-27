import type { TestCase } from "@content/_authoring/types";

export const functionName = "applyPatch";

export const tests: TestCase[] = [
  {
    name: "replaces a field and appends to an array",
    args: [
      { name: "Ada", tags: ["admin"] },
      [
        { op: "replace", path: "/name", value: "Ada L." },
        { op: "add", path: "/tags/-", value: "billing" },
      ],
    ],
    expected: { name: "Ada L.", tags: ["admin", "billing"] },
  },
  {
    name: "inserts into an array at an index",
    args: [{ items: [1, 3] }, [{ op: "add", path: "/items/1", value: 2 }]],
    expected: { items: [1, 2, 3] },
  },
  {
    name: "removes a key and an array element",
    args: [
      { a: 1, b: [1, 2, 3] },
      [
        { op: "remove", path: "/a" },
        { op: "remove", path: "/b/0" },
      ],
    ],
    expected: { b: [2, 3] },
  },
  {
    name: "moves then copies a value",
    args: [
      { draft: { title: "Hi" }, published: {} },
      [
        { op: "move", from: "/draft/title", path: "/published/title" },
        { op: "copy", from: "/published/title", path: "/slug" },
      ],
    ],
    expected: { draft: {}, published: { title: "Hi" }, slug: "Hi" },
  },
  {
    name: "a failing test op rejects the whole patch",
    args: [
      { version: 3, name: "x" },
      [
        { op: "replace", path: "/name", value: "y" },
        { op: "test", path: "/version", value: 2 },
      ],
    ],
    expected: null,
  },
  {
    name: "decodes ~1 and ~0 in pointer tokens",
    args: [{ "a/b": { "m~n": 1 } }, [{ op: "replace", path: "/a~1b/m~0n", value: 2 }]],
    expected: { "a/b": { "m~n": 2 } },
  },
  {
    name: "test compares objects regardless of key order",
    args: [
      { meta: { a: 1, b: [1, 2] } },
      [
        { op: "test", path: "/meta", value: { b: [1, 2], a: 1 } },
        { op: "add", path: "/ok", value: true },
      ],
    ],
    expected: { meta: { a: 1, b: [1, 2] }, ok: true },
  },
  {
    name: "replace on a missing key fails",
    args: [{ a: 1 }, [{ op: "replace", path: "/b", value: 2 }]],
    expected: null,
    hidden: true,
  },
  {
    name: "adding past the end of an array fails",
    args: [{ list: [1] }, [{ op: "add", path: "/list/3", value: 9 }]],
    expected: null,
    hidden: true,
  },
  {
    name: "an index with a leading zero is invalid",
    args: [{ list: [1, 2] }, [{ op: "remove", path: "/list/01" }]],
    expected: null,
    hidden: true,
  },
  {
    name: "moving a value into its own child fails",
    args: [{ a: { b: 1 } }, [{ op: "move", from: "/a", path: "/a/c" }]],
    expected: null,
    hidden: true,
  },
  {
    name: "add at the empty pointer replaces the whole document",
    args: [{ a: 1 }, [{ op: "add", path: "", value: [1] }]],
    expected: [1],
    hidden: true,
  },
];
