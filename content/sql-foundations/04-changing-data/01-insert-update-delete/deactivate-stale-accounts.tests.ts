import type { TestCase } from "@content/_authoring/types";

export const functionName = "deactivateStaleAccounts";

export const tests: TestCase[] = [
  {
    name: "deactivates active accounts that last logged in before the cutoff",
    args: [
      [
        { id: 1, email: "a@x.io", status: "active", lastLoginAt: "2025-11-30" },
        { id: 2, email: "b@x.io", status: "active", lastLoginAt: "2026-03-01" },
        { id: 3, email: "c@x.io", status: "active", lastLoginAt: "2025-06-15" },
      ],
      "2026-01-01",
    ],
    expected: {
      rowsAffected: 2,
      rows: [
        { id: 1, email: "a@x.io", status: "inactive", lastLoginAt: "2025-11-30" },
        { id: 2, email: "b@x.io", status: "active", lastLoginAt: "2026-03-01" },
        { id: 3, email: "c@x.io", status: "inactive", lastLoginAt: "2025-06-15" },
      ],
    },
  },
  {
    name: "a NULL last login and a non-active status are not matched",
    args: [
      [
        { id: 4, email: "d@x.io", status: "active", lastLoginAt: null },
        { id: 5, email: "e@x.io", status: "banned", lastLoginAt: "2020-01-01" },
      ],
      "2026-01-01",
    ],
    expected: {
      rowsAffected: 0,
      rows: [
        { id: 4, email: "d@x.io", status: "active", lastLoginAt: null },
        { id: 5, email: "e@x.io", status: "banned", lastLoginAt: "2020-01-01" },
      ],
    },
  },
  {
    name: "the cutoff itself is not included (strictly less than)",
    args: [[{ id: 6, email: "f@x.io", status: "active", lastLoginAt: "2026-01-01" }], "2026-01-01"],
    expected: {
      rowsAffected: 0,
      rows: [{ id: 6, email: "f@x.io", status: "active", lastLoginAt: "2026-01-01" }],
    },
    hidden: true,
  },
  {
    name: "rows affected counts every matching row",
    args: [
      [
        { id: 7, email: "g@x.io", status: "active", lastLoginAt: "2024-01-01" },
        { id: 8, email: "h@x.io", status: "active", lastLoginAt: "2024-02-01" },
      ],
      "2026-01-01",
    ],
    expected: {
      rowsAffected: 2,
      rows: [
        { id: 7, email: "g@x.io", status: "inactive", lastLoginAt: "2024-01-01" },
        { id: 8, email: "h@x.io", status: "inactive", lastLoginAt: "2024-02-01" },
      ],
    },
    hidden: true,
  },
];
