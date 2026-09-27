import type { TestCase } from "@content/_authoring/types";

export const functionName = "buildQuery";

export const tests: TestCase[] = [
  {
    name: "selects every column",
    args: [{ table: "users" }],
    expected: { ok: true, sql: 'SELECT * FROM "users"', params: [] },
  },
  {
    name: "parameterizes where values in order",
    args: [
      {
        table: "orders",
        columns: ["id", "total_cents"],
        where: [
          { column: "status", op: "=", value: "paid" },
          { column: "total_cents", op: ">=", value: 5000 },
        ],
      },
    ],
    expected: {
      ok: true,
      sql: 'SELECT "id", "total_cents" FROM "orders" WHERE "status" = $1 AND "total_cents" >= $2',
      params: ["paid", 5000],
    },
  },
  {
    name: "expands IN lists and numbers placeholders across the query",
    args: [
      {
        table: "products",
        where: [
          { column: "category", op: "in", value: ["books", "games"] },
          { column: "name", op: "like", value: "%star%" },
        ],
        orderBy: [{ column: "price", direction: "desc" }, { column: "name" }],
        limit: 20,
        offset: 40,
      },
    ],
    expected: {
      ok: true,
      sql: 'SELECT * FROM "products" WHERE "category" IN ($1, $2) AND "name" LIKE $3 ORDER BY "price" DESC, "name" ASC LIMIT $4 OFFSET $5',
      params: ["books", "games", "%star%", 20, 40],
    },
  },
  {
    name: "null equality becomes IS NULL / IS NOT NULL",
    args: [
      {
        table: "tasks",
        where: [
          { column: "deleted_at", op: "=", value: null },
          { column: "assignee_id", op: "!=", value: null },
        ],
      },
    ],
    expected: {
      ok: true,
      sql: 'SELECT * FROM "tasks" WHERE "deleted_at" IS NULL AND "assignee_id" IS NOT NULL',
      params: [],
    },
  },
  {
    name: "an empty IN list matches nothing",
    args: [{ table: "users", where: [{ column: "id", op: "in", value: [] }] }],
    expected: { ok: true, sql: 'SELECT * FROM "users" WHERE 1 = 0', params: [] },
  },
  {
    name: "rejects an injected identifier",
    args: [{ table: "users", columns: ["id", "name; DROP TABLE users"] }],
    expected: { ok: false, error: "Invalid identifier: name; DROP TABLE users" },
  },
  {
    name: "values are never spliced into the SQL",
    args: [{ table: "users", where: [{ column: "email", op: "=", value: "' OR 1=1 --" }] }],
    expected: { ok: true, sql: 'SELECT * FROM "users" WHERE "email" = $1', params: ["' OR 1=1 --"] },
  },
  {
    name: "comparing with null using < is an error",
    args: [{ table: "users", where: [{ column: "age", op: "<", value: null }] }],
    expected: { ok: false, error: "Cannot compare age with null using <" },
    hidden: true,
  },
  {
    name: "IN with a non-array is an error",
    args: [{ table: "users", where: [{ column: "id", op: "in", value: 5 }] }],
    expected: { ok: false, error: "IN requires an array: id" },
    hidden: true,
  },
  {
    name: "a negative or fractional limit is an error",
    args: [{ table: "users", limit: 2.5 }],
    expected: { ok: false, error: "Invalid limit" },
    hidden: true,
  },
  {
    name: "offset without limit, and an invalid order column",
    args: [{ table: "users", offset: 10, orderBy: [{ column: "created at" }] }],
    expected: { ok: false, error: "Invalid identifier: created at" },
    hidden: true,
  },
];
