import type { TestCase } from "@content/_authoring/types";

export const functionName = "deepMerge";

const base = {
  server: { port: 3000, host: "localhost", cors: { origins: ["http://a.test"] } },
  features: ["search"],
  logLevel: "info",
};

export const tests: TestCase[] = [
  {
    name: "merges nested objects and keeps base key order",
    args: [base, { server: { port: 8080 }, logLevel: "debug" }, "replace"],
    expected: {
      server: { port: 8080, host: "localhost", cors: { origins: ["http://a.test"] } },
      features: ["search"],
      logLevel: "debug",
    },
  },
  {
    name: "new keys are appended after base keys",
    args: [{ a: 1 }, { c: 3, b: 2 }, "replace"],
    expected: { a: 1, c: 3, b: 2 },
  },
  {
    name: "replace policy swaps arrays",
    args: [base, { features: ["billing"] }, "replace"],
    expected: {
      server: { port: 3000, host: "localhost", cors: { origins: ["http://a.test"] } },
      features: ["billing"],
      logLevel: "info",
    },
  },
  {
    name: "concat policy appends arrays, nested too",
    args: [base, { server: { cors: { origins: ["http://b.test"] } }, features: ["search"] }, "concat"],
    expected: {
      server: { port: 3000, host: "localhost", cors: { origins: ["http://a.test", "http://b.test"] } },
      features: ["search", "search"],
      logLevel: "info",
    },
  },
  {
    name: "union policy removes duplicates",
    args: [{ tags: ["a", "b", "a"] }, { tags: ["b", "c"] }, "union"],
    expected: { tags: ["a", "b", "c"] },
  },
  {
    name: "null deletes a key",
    args: [{ keep: 1, drop: { deep: true } }, { drop: null }, "replace"],
    expected: { keep: 1 },
  },
  {
    name: "a type mismatch lets the override win",
    args: [{ retry: { times: 3 } }, { retry: false }, "replace"],
    expected: { retry: false },
  },
  {
    name: "union compares objects by content",
    args: [{ users: [{ id: 1 }, { id: 2 }] }, { users: [{ id: 2 }, { id: 3 }] }, "union"],
    expected: { users: [{ id: 1 }, { id: 2 }, { id: 3 }] },
    hidden: true,
  },
  {
    name: "null for a key that is not in base is not added",
    args: [{ a: 1 }, { ghost: null }, "replace"],
    expected: { a: 1 },
    hidden: true,
  },
  {
    name: "an array does not merge into an object",
    args: [{ list: { x: 1 } }, { list: [1, 2] }, "concat"],
    expected: { list: [1, 2] },
    hidden: true,
  },
];
