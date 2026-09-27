import type { TestCase } from "@content/_authoring/types";

export const functionName = "Plan";

const r = (Id: number, Status: string, Total: number) => ({ Id, Status, Total });

const table = [
  r(1, "paid", 120),
  r(2, "pending", 40),
  r(3, "paid", 15),
  r(4, "paid", 300),
  r(5, "refunded", 80),
  r(6, "paid", 120),
];

const step = (Kind: string, extra: { Status?: string; Min?: number; Count?: number } = {}) => ({
  Kind,
  Status: extra.Status ?? null,
  Min: extra.Min ?? null,
  Count: extra.Count ?? null,
});

export const tests: TestCase[] = [
  {
    name: "a fully translatable query runs on the server and fetches only the result",
    args: [table, [step("whereStatus", { Status: "paid" }), step("orderByTotal"), step("take", { Count: 2 })]],
    expected: {
      ServerSteps: ["whereStatus", "orderByTotal", "take"],
      ClientSteps: [],
      RowsFetched: 2,
      Ids: [4, 1],
      Error: null,
    },
  },
  {
    name: "AsEnumerable too early pulls every row into memory",
    args: [table, [step("asEnumerable"), step("whereStatus", { Status: "paid" }), step("take", { Count: 1 })]],
    expected: {
      ServerSteps: [],
      ClientSteps: ["whereStatus", "take"],
      RowsFetched: 6,
      Ids: [1],
      Error: null,
    },
  },
  {
    name: "an untranslatable filter on the server fails the query",
    args: [table, [step("whereStatus", { Status: "paid" }), step("whereLocal", { Min: 100 })]],
    expected: { ServerSteps: [], ClientSteps: [], RowsFetched: 0, Ids: [], Error: "whereLocal could not be translated" },
  },
  {
    name: "filter on the server, then run the local method in memory",
    args: [table, [step("whereStatus", { Status: "paid" }), step("asEnumerable"), step("whereLocal", { Min: 100 })]],
    expected: {
      ServerSteps: ["whereStatus"],
      ClientSteps: ["whereLocal"],
      RowsFetched: 4,
      Ids: [1, 4, 6],
      Error: null,
    },
  },
  {
    name: "no steps fetches the table in table order",
    args: [table, []],
    expected: { ServerSteps: [], ClientSteps: [], RowsFetched: 6, Ids: [1, 2, 3, 4, 5, 6], Error: null },
  },
  {
    name: "order ties are broken by Id",
    args: [table, [step("whereMinTotal", { Min: 100 }), step("orderByTotal")]],
    expected: {
      ServerSteps: ["whereMinTotal", "orderByTotal"],
      ClientSteps: [],
      RowsFetched: 3,
      Ids: [4, 1, 6],
      Error: null,
    },
  },
  {
    name: "a second AsEnumerable changes nothing",
    args: [
      table,
      [step("orderByTotal"), step("asEnumerable"), step("take", { Count: 3 }), step("asEnumerable"), step("whereStatus", { Status: "paid" })],
    ],
    expected: {
      ServerSteps: ["orderByTotal"],
      ClientSteps: ["take", "whereStatus"],
      RowsFetched: 6,
      Ids: [4, 1, 6],
      Error: null,
    },
    hidden: true,
  },
  {
    name: "whereLocal as the very first step fails too",
    args: [table, [step("whereLocal", { Min: 0 }), step("asEnumerable")]],
    expected: { ServerSteps: [], ClientSteps: [], RowsFetched: 0, Ids: [], Error: "whereLocal could not be translated" },
    hidden: true,
  },
];
