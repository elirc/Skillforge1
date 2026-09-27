import type { TestCase } from "@content/_authoring/types";

export const functionName = "getPath";

const doc = {
  user: { name: "Ada", nickname: null, emails: ["ada@x.io", "ada@y.io"] },
  "feature.flags": { beta: true },
  "it's": "quoted",
  orders: [{ id: "o1", lines: [{ sku: "MUG", qty: 2 }] }],
  "7": "seven",
};

export const tests: TestCase[] = [
  { name: "reads a nested key", args: [doc, "user.name", "?"], expected: { found: true, value: "Ada" } },
  { name: "reads array items", args: [doc, "user.emails[1]", "?"], expected: { found: true, value: "ada@y.io" } },
  { name: "the empty path is the root itself", args: [7, "", 0], expected: { found: true, value: 7 } },
  {
    name: "walks through arrays of objects",
    args: [doc, "orders[0].lines[0].qty", 0],
    expected: { found: true, value: 2 },
  },
  { name: "a stored null is found", args: [doc, "user.nickname", "none"], expected: { found: true, value: null } },
  { name: "missing keys use the fallback", args: [doc, "user.phone", "n/a"], expected: { found: false, value: "n/a" } },
  {
    name: "quoted keys may contain dots",
    args: [doc, '["feature.flags"].beta', false],
    expected: { found: true, value: true },
  },
  {
    name: "out-of-range indexes are missing",
    args: [doc, "user.emails[5]", null],
    expected: { found: false, value: null },
  },
  {
    name: "malformed paths report an error",
    args: [doc, "user..name", "?"],
    expected: { found: false, value: "?", error: "Invalid path" },
  },
  {
    name: "prototype keys are not own properties",
    args: [doc, "user.constructor", "safe"],
    expected: { found: false, value: "safe" },
    hidden: true,
  },
  {
    name: "single-quoted keys support backslash escapes",
    args: [{ root: doc }, "root['it\\'s']", "?"],
    expected: { found: true, value: "quoted" },
    hidden: true,
  },
  {
    name: "more malformed paths",
    args: [doc, "orders[0", "?"],
    expected: { found: false, value: "?", error: "Invalid path" },
    hidden: true,
  },
  {
    name: "an index segment on an object reads a numeric key",
    args: [{ inner: doc }, "inner[7]", "?"],
    expected: { found: true, value: "seven" },
    hidden: true,
  },
];
