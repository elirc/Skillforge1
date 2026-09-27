import type { TestCase } from "@content/_authoring/types";

export const functionName = "diffRows";

const pen = { id: "p1", name: "Pen", price: 2, active: true };
const ink = { id: "p2", name: "Ink", price: 5, active: true };
const pad = { id: "p3", name: "Pad", price: 4, active: true };

export const tests: TestCase[] = [
  { name: "no changes means no operations", args: [[pen, ink], [pen, ink]], expected: [] },
  { name: "a new row is inserted", args: [[pen], [pen, ink]], expected: [{ op: "insert", item: ink }] },
  { name: "a missing row is deleted", args: [[pen, ink], [ink]], expected: [{ op: "delete", id: "p1" }] },
  {
    name: "updates carry only the changed fields",
    args: [[pen], [{ ...pen, price: 3 }]],
    expected: [{ op: "update", id: "p1", changes: { price: 3 } }],
  },
  {
    name: "orders deletes, then updates, then inserts",
    args: [
      [pen, ink, pad],
      [{ id: "p4", name: "Tape", price: 1, active: true }, { ...pad, name: "Notepad" }, pen],
    ],
    expected: [
      { op: "delete", id: "p2" },
      { op: "update", id: "p3", changes: { name: "Notepad" } },
      { op: "insert", item: { id: "p4", name: "Tape", price: 1, active: true } },
    ],
  },
  { name: "reordering is not a change", args: [[pen, ink, pad], [pad, pen, ink]], expected: [] },
  {
    name: "detects changes to falsy values",
    args: [[pen], [{ ...pen, price: 0, active: false }]],
    expected: [{ op: "update", id: "p1", changes: { price: 0, active: false } }],
    hidden: true,
  },
  { name: "two empty lists", args: [[], []], expected: [], hidden: true },
  {
    name: "replacing every row deletes all then inserts all",
    args: [[pen, ink], [pad]],
    expected: [
      { op: "delete", id: "p1" },
      { op: "delete", id: "p2" },
      { op: "insert", item: pad },
    ],
    hidden: true,
  },
];
