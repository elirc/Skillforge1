import type { TestCase } from "@content/_authoring/types";

export const functionName = "applyEdits";

const profile = { name: "Ada", address: { city: "London", zip: "N1" }, tags: ["admin", "beta"] };

export const tests: TestCase[] = [
  {
    name: "setting a nested field leaves the original alone",
    args: [profile, [{ op: "set", path: ["address", "city"], value: "Paris" }]],
    expected: {
      original: { name: "Ada", address: { city: "London", zip: "N1" }, tags: ["admin", "beta"] },
      next: { name: "Ada", address: { city: "Paris", zip: "N1" }, tags: ["admin", "beta"] },
    },
  },
  {
    name: "pushing to an array returns a new array",
    args: [profile, [{ op: "push", path: ["tags"], value: "owner" }]],
    expected: {
      original: { name: "Ada", address: { city: "London", zip: "N1" }, tags: ["admin", "beta"] },
      next: { name: "Ada", address: { city: "London", zip: "N1" }, tags: ["admin", "beta", "owner"] },
    },
  },
  {
    name: "removing by index",
    args: [profile, [{ op: "remove", path: ["tags"], index: 0 }]],
    expected: {
      original: { name: "Ada", address: { city: "London", zip: "N1" }, tags: ["admin", "beta"] },
      next: { name: "Ada", address: { city: "London", zip: "N1" }, tags: ["beta"] },
    },
  },
  {
    name: "several edits apply in order",
    args: [
      profile,
      [
        { op: "set", path: ["name"], value: "Grace" },
        { op: "push", path: ["tags"], value: "owner" },
        { op: "remove", path: ["tags"], index: 1 },
      ],
    ],
    expected: {
      original: { name: "Ada", address: { city: "London", zip: "N1" }, tags: ["admin", "beta"] },
      next: { name: "Grace", address: { city: "London", zip: "N1" }, tags: ["admin", "owner"] },
    },
  },
  {
    name: "editing an object inside an array",
    args: [
      { lines: [{ sku: "A", qty: 1 }, { sku: "B", qty: 2 }] },
      [{ op: "set", path: ["lines", "1", "qty"], value: 5 }],
    ],
    expected: {
      original: { lines: [{ sku: "A", qty: 1 }, { sku: "B", qty: 2 }] },
      next: { lines: [{ sku: "A", qty: 1 }, { sku: "B", qty: 5 }] },
    },
  },
  {
    name: "no edits returns an equal state",
    args: [{ a: 1 }, []],
    expected: { original: { a: 1 }, next: { a: 1 } },
  },
  {
    name: "setting a new key appends it",
    args: [{ name: "Ada" }, [{ op: "set", path: ["email"], value: "ada@example.com" }]],
    expected: { original: { name: "Ada" }, next: { name: "Ada", email: "ada@example.com" } },
    hidden: true,
  },
  {
    name: "pushing into an array nested in an array item",
    args: [
      { lists: [{ title: "Todo", cards: ["a"] }] },
      [{ op: "push", path: ["lists", "0", "cards"], value: "b" }],
    ],
    expected: {
      original: { lists: [{ title: "Todo", cards: ["a"] }] },
      next: { lists: [{ title: "Todo", cards: ["a", "b"] }] },
    },
    hidden: true,
  },
];
