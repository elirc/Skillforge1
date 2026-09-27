import type { TestCase } from "@content/_authoring/types";

export const functionName = "ApplyUpdates";

// Records are JSON objects keyed by their C# property names.
const desk = { Id: 1, Version: 1, Title: "Desk", Quantity: 5 };
const chair = { Id: 2, Version: 4, Title: "Chair", Quantity: 10 };
const rows = [desk, chair];

const update = (Id: number, ExpectedVersion: number, Title: string | null, Quantity: number | null) => ({
  Id,
  ExpectedVersion,
  Title,
  Quantity,
});

export const tests: TestCase[] = [
  {
    name: "applies an up-to-date update and bumps the version",
    args: [rows, [update(1, 1, "Oak desk", null)]],
    expected: { Outcomes: ["1: applied v2"], Rows: [{ ...desk, Version: 2, Title: "Oak desk" }, chair] },
  },
  {
    name: "merges two stale edits to different fields",
    args: [rows, [update(1, 1, "Oak desk", null), update(1, 1, null, 3)]],
    expected: {
      Outcomes: ["1: applied v2", "1: applied v3"],
      Rows: [{ Id: 1, Version: 3, Title: "Oak desk", Quantity: 3 }, chair],
    },
  },
  {
    name: "rejects a stale edit to the same field",
    args: [rows, [update(1, 1, "Oak desk", null), update(1, 1, "Pine desk", null)]],
    expected: {
      Outcomes: ["1: applied v2", "1: conflict on Title"],
      Rows: [{ ...desk, Version: 2, Title: "Oak desk" }, chair],
    },
  },
  {
    name: "reports missing rows and impossible versions",
    args: [rows, [update(9, 1, "X", null), update(1, 5, "X", null)]],
    expected: { Outcomes: ["9: not found", "1: invalid version 5"], Rows: rows },
  },
  {
    name: "an empty patch changes nothing",
    args: [rows, [update(2, 4, null, null)]],
    expected: { Outcomes: ["2: no changes"], Rows: rows },
  },
  {
    name: "a read older than the known history conflicts",
    args: [rows, [update(2, 3, null, 1)]],
    expected: { Outcomes: ["2: conflict on Quantity"], Rows: rows },
  },
  {
    name: "a partial conflict applies nothing from that update",
    args: [rows, [update(1, 1, null, 7), update(1, 1, "New", 8)]],
    expected: {
      Outcomes: ["1: applied v2", "1: conflict on Quantity"],
      Rows: [{ ...desk, Version: 2, Quantity: 7 }, chair],
    },
    hidden: true,
  },
  {
    name: "a retry with the fresh version succeeds",
    args: [rows, [update(1, 1, "A", null), update(1, 1, "B", null), update(1, 2, "B", null)]],
    expected: {
      Outcomes: ["1: applied v2", "1: conflict on Title", "1: applied v3"],
      Rows: [{ ...desk, Version: 3, Title: "B" }, chair],
    },
    hidden: true,
  },
  {
    name: "no updates leaves rows untouched",
    args: [rows, []],
    expected: { Outcomes: [], Rows: rows },
    hidden: true,
  },
];
