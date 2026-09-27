import type { TestCase } from "@content/_authoring/types";

export const functionName = "dailyTotalsUtc";

export const tests: TestCase[] = [
  {
    name: "UTC timestamps bucket by their date part",
    args: [
      [
        { id: 1, at: "2026-03-01T09:00:00Z", amountCents: 500 },
        { id: 2, at: "2026-03-01T17:30:00Z", amountCents: 250 },
        { id: 3, at: "2026-03-02T08:00:00Z", amountCents: 100 },
      ],
    ],
    expected: [
      { day: "2026-03-01", totalCents: 750, payments: 2 },
      { day: "2026-03-02", totalCents: 100, payments: 1 },
    ],
  },
  {
    name: "an evening payment in New York is the next UTC day",
    args: [[{ id: 1, at: "2026-03-01T21:00:00-05:00", amountCents: 900 }]],
    expected: [{ day: "2026-03-02", totalCents: 900, payments: 1 }],
  },
  {
    name: "an early-morning payment in Tokyo is the previous UTC day",
    args: [[{ id: 1, at: "2026-03-02T06:00:00+09:00", amountCents: 300 }]],
    expected: [{ day: "2026-03-01", totalCents: 300, payments: 1 }],
  },
  {
    name: "mixed offsets that are the same UTC day share a bucket",
    args: [
      [
        { id: 1, at: "2026-06-10T23:00:00+02:00", amountCents: 100 },
        { id: 2, at: "2026-06-10T12:00:00Z", amountCents: 200 },
        { id: 3, at: "2026-06-10T19:59:00-04:00", amountCents: 300 },
      ],
    ],
    expected: [{ day: "2026-06-10", totalCents: 600, payments: 3 }],
  },
  {
    name: "buckets are ordered by day",
    args: [
      [
        { id: 1, at: "2026-01-05T10:00:00Z", amountCents: 1 },
        { id: 2, at: "2025-12-31T10:00:00Z", amountCents: 2 },
      ],
    ],
    expected: [
      { day: "2025-12-31", totalCents: 2, payments: 1 },
      { day: "2026-01-05", totalCents: 1, payments: 1 },
    ],
  },
  {
    name: "unparseable timestamps are skipped",
    args: [
      [
        { id: 1, at: "not a date", amountCents: 999 },
        { id: 2, at: "2026-02-01T00:00:00Z", amountCents: 5 },
      ],
    ],
    expected: [{ day: "2026-02-01", totalCents: 5, payments: 1 }],
    hidden: true,
  },
  { name: "no events", args: [[]], expected: [], hidden: true },
];
