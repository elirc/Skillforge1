import type { TestCase } from "@content/_authoring/types";

export const functionName = "diff";

export const tests: TestCase[] = [
  { name: "identical values have no changes", args: [{ a: 1, b: [1, 2] }, { a: 1, b: [1, 2] }], expected: [] },
  {
    name: "a changed nested field",
    args: [{ user: { name: "Ada", role: "viewer" } }, { user: { name: "Ada", role: "admin" } }],
    expected: [{ path: "user.role", kind: "changed", before: "viewer", after: "admin" }],
  },
  {
    name: "added and removed keys",
    args: [{ title: "Post", draft: true }, { title: "Post", publishedAt: "2026-09-01" }],
    expected: [
      { path: "draft", kind: "removed", before: true },
      { path: "publishedAt", kind: "added", after: "2026-09-01" },
    ],
  },
  {
    name: "arrays compare index by index",
    args: [{ tags: ["ts", "js", "css"] }, { tags: ["ts", "go"] }],
    expected: [
      { path: "tags[1]", kind: "changed", before: "js", after: "go" },
      { path: "tags[2]", kind: "removed", before: "css" },
    ],
  },
  {
    name: "objects inside arrays",
    args: [
      { items: [{ sku: "A", qty: 1 }] },
      { items: [{ sku: "A", qty: 3 }, { sku: "B", qty: 1 }] },
    ],
    expected: [
      { path: "items[0].qty", kind: "changed", before: 1, after: 3 },
      { path: "items[1]", kind: "added", after: { sku: "B", qty: 1 } },
    ],
  },
  {
    name: "a type change is a single changed entry",
    args: [{ address: { city: "Oslo" } }, { address: null }],
    expected: [{ path: "address", kind: "changed", before: { city: "Oslo" }, after: null }],
  },
  {
    name: "changed primitives at the root use an empty path",
    args: [1, 2],
    expected: [{ path: "", kind: "changed", before: 1, after: 2 }],
  },
  {
    name: "root arrays start paths with a bracket",
    args: [[{ id: 1 }], [{ id: 2 }]],
    expected: [{ path: "[0].id", kind: "changed", before: 1, after: 2 }],
    hidden: true,
  },
  {
    name: "an array replaced by an object is one change",
    args: [{ v: [1] }, { v: { "0": 1 } }],
    expected: [{ path: "v", kind: "changed", before: [1], after: { "0": 1 } }],
    hidden: true,
  },
  {
    name: "a null value that stays null is not a change",
    args: [{ a: null, b: false }, { a: null, b: 0 }],
    expected: [{ path: "b", kind: "changed", before: false, after: 0 }],
    hidden: true,
  },
];
