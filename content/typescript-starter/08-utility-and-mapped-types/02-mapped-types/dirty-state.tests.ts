import type { TestCase } from "@content/_authoring/types";

export const functionName = "dirtyState";

export const tests: TestCase[] = [
  {
    name: "nothing changed",
    args: [{ name: "Ada", age: 36 }, { name: "Ada", age: 36 }],
    expected: { dirty: { name: false, age: false }, patch: {} },
  },
  {
    name: "one field changed",
    args: [{ name: "Ada", age: 36 }, { name: "Ada", age: 37 }],
    expected: { dirty: { name: false, age: true }, patch: { age: 37 } },
  },
  {
    name: "arrays compare by content",
    args: [
      { title: "Post", tags: ["ts", "web"] },
      { title: "Post", tags: ["ts", "web"] },
    ],
    expected: { dirty: { title: false, tags: false }, patch: {} },
  },
  {
    name: "a reordered array counts as a change",
    args: [{ tags: ["a", "b"] }, { tags: ["b", "a"] }],
    expected: { dirty: { tags: true }, patch: { tags: ["b", "a"] } },
  },
  {
    name: "patch keeps the original key order",
    args: [
      { email: "a@x.io", name: "A", bio: "" },
      { bio: "Hi", name: "B", email: "a@x.io" },
    ],
    expected: { dirty: { email: false, name: true, bio: true }, patch: { name: "B", bio: "Hi" } },
  },
  {
    name: "nested objects compare by content",
    args: [
      { address: { city: "Oslo", zip: "0150" } },
      { address: { city: "Bergen", zip: "0150" } },
    ],
    expected: { dirty: { address: true }, patch: { address: { city: "Bergen", zip: "0150" } } },
    hidden: true,
  },
  {
    name: "a value changed to null is a change",
    args: [{ avatarUrl: "a.png", name: "A" }, { avatarUrl: null, name: "A" }],
    expected: { dirty: { avatarUrl: true, name: false }, patch: { avatarUrl: null } },
    hidden: true,
  },
];
