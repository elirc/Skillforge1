import type { TestCase } from "@content/_authoring/types";

export const functionName = "filterUsers";

export const tests: TestCase[] = [
  {
    name: "keeps well-formed users",
    args: [[{ id: "u1", name: "Ada", age: 36 }]],
    expected: [{ id: "u1", name: "Ada", age: 36 }],
  },
  {
    name: "drops primitives, null, and arrays",
    args: [["u1", 42, null, [], { id: "u2", name: "Grace", age: 45 }]],
    expected: [{ id: "u2", name: "Grace", age: 45 }],
  },
  {
    name: "rejects an age sent as a string",
    args: [[{ id: "u1", name: "Ada", age: "36" }]],
    expected: [],
  },
  {
    name: "rejects a missing name",
    args: [[{ id: "u1", age: 36 }]],
    expected: [],
  },
  {
    name: "keeps extra fields on valid users",
    args: [[{ id: "u3", name: "Linus", age: 20, admin: true }]],
    expected: [{ id: "u3", name: "Linus", age: 20, admin: true }],
  },
  {
    name: "rejects an empty id",
    args: [[{ id: "", name: "Nobody", age: 1 }]],
    expected: [],
    hidden: true,
  },
  {
    name: "rejects negative and fractional ages",
    args: [[{ id: "a", name: "A", age: -1 }, { id: "b", name: "B", age: 2.5 }, { id: "c", name: "C", age: 0 }]],
    expected: [{ id: "c", name: "C", age: 0 }],
    hidden: true,
  },
];
