import type { TestCase } from "@content/_authoring/types";

export const functionName = "auditLines";

export const tests: TestCase[] = [
  {
    name: "a changed string",
    args: [{ title: "Draft", status: "open" }, { title: "Final", status: "open" }, []],
    expected: ['title: "Draft" -> "Final"'],
  },
  {
    name: "arrays are compared as sets",
    args: [{ tags: ["a", "b"] }, { tags: ["b", "c", "d"] }, []],
    expected: ['tags: added "c", "d"', 'tags: removed "a"'],
  },
  {
    name: "ignored keys are skipped",
    args: [{ n: 1, updatedAt: "x" }, { n: 2, updatedAt: "y" }, ["updatedAt"]],
    expected: ["n: 1 -> 2"],
  },
  {
    name: "cleared and newly set keys, with null counting as present",
    args: [{ a: 1, b: 2 }, { b: 2, c: null }, []],
    expected: ["a: cleared (was 1)", "c: set to null"],
  },
  {
    name: "reordering an array is not a change",
    args: [{ tags: ["a", "b"] }, { tags: ["b", "a"] }, []],
    expected: [],
  },
  {
    name: "nested objects are compared by value",
    args: [{ address: { city: "Oslo" } }, { address: { city: "Bergen" } }, []],
    expected: ['address: {"city":"Oslo"} -> {"city":"Bergen"}'],
  },
  {
    name: "duplicates inside an array are reported once",
    args: [{ ids: [1] }, { ids: [1, 2, 2, 3] }, []],
    expected: ["ids: added 2, 3"],
  },
  { name: "array to scalar is a plain change", args: [{ x: [1] }, { x: 1 }, []], expected: ["x: [1] -> 1"], hidden: true },
  { name: "null to a value", args: [{ owner: null }, { owner: "ann" }, []], expected: ['owner: null -> "ann"'], hidden: true },
  { name: "identical records", args: [{ a: 1, t: ["x"] }, { a: 1, t: ["x"] }, []], expected: [], hidden: true },
];
