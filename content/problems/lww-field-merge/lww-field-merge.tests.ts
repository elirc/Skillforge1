import type { TestCase } from "@content/_authoring/types";

export const functionName = "mergeReplicas";

const e = (value: string | number | boolean | null, ts: number, node: string) => ({ value, ts, node });

const laptop = { title: e("Draft", 1, "laptop"), theme: e("dark", 5, "laptop") };
const phone = { title: e("Final", 3, "phone"), theme: e("light", 2, "phone") };

export const tests: TestCase[] = [
  {
    name: "the newest write wins per field",
    args: [[laptop, phone]],
    expected: {
      view: { theme: "dark", title: "Final" },
      state: { theme: e("dark", 5, "laptop"), title: e("Final", 3, "phone") },
    },
  },
  {
    name: "merge order does not matter",
    args: [[phone, laptop]],
    expected: {
      view: { theme: "dark", title: "Final" },
      state: { theme: e("dark", 5, "laptop"), title: e("Final", 3, "phone") },
    },
  },
  {
    name: "equal timestamps are broken by node name",
    args: [[{ title: e("A", 5, "n2") }, { title: e("B", 5, "n1") }]],
    expected: { view: { title: "A" }, state: { title: e("A", 5, "n2") } },
  },
  {
    name: "a newer tombstone hides the field but stays in state",
    args: [[{ tag: e("red", 1, "a") }, { tag: e(null, 2, "b") }]],
    expected: { view: {}, state: { tag: e(null, 2, "b") } },
  },
  {
    name: "a newer write beats an older delete",
    args: [[{ tag: e(null, 2, "b") }, { tag: e("blue", 4, "a") }]],
    expected: { view: { tag: "blue" }, state: { tag: e("blue", 4, "a") } },
  },
  { name: "no replicas", args: [[]], expected: { view: {}, state: {} } },
  {
    name: "falsy values are not deletes",
    args: [[{ count: e(0, 1, "a"), label: e("", 1, "a"), on: e(false, 1, "a") }]],
    expected: {
      view: { count: 0, label: "", on: false },
      state: { count: e(0, 1, "a"), label: e("", 1, "a"), on: e(false, 1, "a") },
    },
    hidden: true,
  },
  {
    name: "three replicas with disjoint and shared fields",
    args: [[{ a: e(1, 1, "x") }, { b: e(2, 1, "y"), a: e(3, 2, "y") }, { c: e(4, 1, "z"), b: e(null, 1, "z") }]],
    expected: {
      view: { a: 3, c: 4 },
      state: { a: e(3, 2, "y"), b: e(null, 1, "z"), c: e(4, 1, "z") },
    },
    hidden: true,
  },
  {
    name: "merging a replica with itself changes nothing",
    args: [[laptop, laptop]],
    expected: {
      view: { theme: "dark", title: "Draft" },
      state: { theme: e("dark", 5, "laptop"), title: e("Draft", 1, "laptop") },
    },
    hidden: true,
  },
];
