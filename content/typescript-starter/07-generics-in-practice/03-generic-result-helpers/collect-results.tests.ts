import type { TestCase } from "@content/_authoring/types";

export const functionName = "collectResults";

export const tests: TestCase[] = [
  {
    name: "all ok collects values in order",
    args: [
      [
        { ok: true, value: 1 },
        { ok: true, value: 2 },
      ],
    ],
    expected: { ok: true, value: [1, 2] },
  },
  {
    name: "one failure fails the whole batch",
    args: [
      [
        { ok: true, value: "a" },
        { ok: false, error: "b is invalid" },
      ],
    ],
    expected: { ok: false, errors: ["b is invalid"] },
  },
  {
    name: "collects every error, not just the first",
    args: [
      [
        { ok: false, error: "email is required" },
        { ok: true, value: "Ada" },
        { ok: false, error: "age must be a number" },
      ],
    ],
    expected: { ok: false, errors: ["email is required", "age must be a number"] },
  },
  { name: "an empty batch is ok", args: [[]], expected: { ok: true, value: [] } },
  {
    name: "works with object values and object errors",
    args: [
      [
        { ok: true, value: { id: 1 } },
        { ok: false, error: { field: "name", message: "too short" } },
      ],
    ],
    expected: { ok: false, errors: [{ field: "name", message: "too short" }] },
    hidden: true,
  },
  {
    name: "falsy values still count as ok values",
    args: [
      [
        { ok: true, value: 0 },
        { ok: true, value: "" },
        { ok: true, value: false },
      ],
    ],
    expected: { ok: true, value: [0, "", false] },
    hidden: true,
  },
];
