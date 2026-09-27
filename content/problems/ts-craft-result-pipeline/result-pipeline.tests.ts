import type { TestCase } from "@content/_authoring/types";

export const functionName = "runPipeline";

const pageSize = [{ op: "trim" }, { op: "toInt" }, { op: "range", min: 1, max: 100 }];

export const tests: TestCase[] = [
  {
    name: "every step succeeds",
    args: [" 25 ", pageSize],
    expected: { ok: true, value: 25, trace: ["trim:ok", "toInt:ok", "range:ok"] },
  },
  {
    name: "the first failure skips the rest",
    args: ["abc", pageSize],
    expected: {
      ok: false,
      error: 'toInt: "abc" is not an integer',
      failedAt: 1,
      trace: ["trim:ok", "toInt:error", "range:skipped"],
    },
  },
  {
    name: "range reports the bounds",
    args: ["500", pageSize],
    expected: {
      ok: false,
      error: "range: 500 is outside 1..100",
      failedAt: 2,
      trace: ["trim:ok", "toInt:ok", "range:error"],
    },
  },
  {
    name: "default recovers from an earlier failure",
    args: ["", [{ op: "trim" }, { op: "nonEmpty" }, { op: "toInt" }, { op: "default", value: 20 }]],
    expected: { ok: true, value: 20, trace: ["trim:ok", "nonEmpty:error", "toInt:skipped", "default:recovered"] },
  },
  {
    name: "default does nothing when the value is fine",
    args: ["7", [{ op: "toInt" }, { op: "default", value: 20 }]],
    expected: { ok: true, value: 7, trace: ["toInt:ok", "default:unused"] },
  },
  {
    name: "lookup maps a value through a table",
    args: [" Pro ", [{ op: "trim" }, { op: "lookup", table: { Free: 0, Pro: 12 } }]],
    expected: { ok: true, value: 12, trace: ["trim:ok", "lookup:ok"] },
  },
  {
    name: "trim rejects non-strings",
    args: [42, pageSize],
    expected: {
      ok: false,
      error: "trim: expected a string",
      failedAt: 0,
      trace: ["trim:error", "toInt:skipped", "range:skipped"],
    },
  },
  {
    name: "a step after recovery can fail again and moves failedAt",
    args: ["x", [{ op: "toInt" }, { op: "default", value: 500 }, { op: "range", min: 1, max: 100 }]],
    expected: {
      ok: false,
      error: "range: 500 is outside 1..100",
      failedAt: 2,
      trace: ["toInt:error", "default:recovered", "range:error"],
    },
    hidden: true,
  },
  {
    name: "lookup ignores inherited keys",
    args: ["toString", [{ op: "lookup", table: { a: 1 } }]],
    expected: { ok: false, error: 'lookup: no entry for "toString"', failedAt: 0, trace: ["lookup:error"] },
    hidden: true,
  },
  {
    name: "no steps returns the input",
    args: [{ keep: true }, []],
    expected: { ok: true, value: { keep: true }, trace: [] },
    hidden: true,
  },
];
