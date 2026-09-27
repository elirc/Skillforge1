import type { TestCase } from "@content/_authoring/types";

export const functionName = "NextPage";

const now = "2026-06-16T12:00:00Z";
const t = (hh: string) => `2026-06-16T${hh}:00:00Z`;
const row = (Id: string, DueAt: string, UserId = "u1") => ({ Id, UserId, DueAt });

const rows = [
  row("r5", t("11")),
  row("r1", t("08")),
  row("r3", t("09")),
  row("r2", t("09")),
  row("r4", t("10")),
  row("x1", t("07"), "u2"),
  row("r9", "2026-06-17T08:00:00Z"),
];

export const tests: TestCase[] = [
  {
    name: "first page is ordered by DueAt then Id and returns a cursor",
    args: [rows, "u1", now, null, 2],
    expected: { Ids: ["r1", "r2"], Next: { DueAt: t("09"), Id: "r2" } },
  },
  {
    name: "the cursor continues after rows that share a DueAt",
    args: [rows, "u1", now, { DueAt: t("09"), Id: "r2" }, 2],
    expected: { Ids: ["r3", "r4"], Next: { DueAt: t("10"), Id: "r4" } },
  },
  {
    name: "the last page has no Next cursor",
    args: [rows, "u1", now, { DueAt: t("10"), Id: "r4" }, 2],
    expected: { Ids: ["r5"], Next: null },
  },
  {
    name: "a page that ends exactly at the last row has no Next cursor",
    args: [rows, "u1", now, null, 5],
    expected: { Ids: ["r1", "r2", "r3", "r4", "r5"], Next: null },
  },
  {
    name: "ignores other users and reviews that are not due",
    args: [rows, "u2", now, null, 10],
    expected: { Ids: ["x1"], Next: null },
  },
  {
    name: "a row inserted before the cursor does not shift the next page",
    args: [[...rows, row("r0", t("06"))], "u1", now, { DueAt: t("09"), Id: "r2" }, 2],
    expected: { Ids: ["r3", "r4"], Next: { DueAt: t("10"), Id: "r4" } },
    hidden: true,
  },
  {
    name: "clamps a page size of 0 up to 1",
    args: [rows, "u1", now, null, 0],
    expected: { Ids: ["r1"], Next: { DueAt: t("08"), Id: "r1" } },
    hidden: true,
  },
  {
    name: "clamps a huge page size down to 50",
    args: [
      Array.from({ length: 60 }, (_, i) => row(`id-${String(i).padStart(2, "0")}`, t("08"))),
      "u1",
      now,
      null,
      1000,
    ],
    expected: {
      Ids: Array.from({ length: 50 }, (_, i) => `id-${String(i).padStart(2, "0")}`),
      Next: { DueAt: t("08"), Id: "id-49" },
    },
    hidden: true,
  },
];
