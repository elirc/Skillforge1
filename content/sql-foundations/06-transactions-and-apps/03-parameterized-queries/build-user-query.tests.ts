import type { TestCase } from "@content/_authoring/types";

export const functionName = "buildUserQuery";

export const tests: TestCase[] = [
  {
    name: "no filters: no WHERE clause, default sort",
    args: [{ name: null, city: null, minAge: null, sortBy: null }],
    expected: { sql: "SELECT id, name, city, age FROM users ORDER BY id", params: [] },
  },
  {
    name: "every filter becomes a numbered parameter, in order",
    args: [{ name: "Ada", city: "Leeds", minAge: 30, sortBy: "age" }],
    expected: {
      sql: "SELECT id, name, city, age FROM users WHERE name = @p0 AND city = @p1 AND age >= @p2 ORDER BY age",
      params: ["Ada", "Leeds", 30],
    },
  },
  {
    name: "numbering skips nothing when a filter is absent",
    args: [{ name: null, city: "Oslo", minAge: 18, sortBy: "city" }],
    expected: {
      sql: "SELECT id, name, city, age FROM users WHERE city = @p0 AND age >= @p1 ORDER BY city",
      params: ["Oslo", 18],
    },
  },
  {
    name: "an injection attempt stays a harmless value",
    args: [{ name: "x' OR '1'='1", city: null, minAge: null, sortBy: null }],
    expected: {
      sql: "SELECT id, name, city, age FROM users WHERE name = @p0 ORDER BY id",
      params: ["x' OR '1'='1"],
    },
    hidden: true,
  },
  {
    name: "an unknown sort column falls back to id",
    args: [{ name: null, city: null, minAge: null, sortBy: "name; DROP TABLE users; --" }],
    expected: { sql: "SELECT id, name, city, age FROM users ORDER BY id", params: [] },
    hidden: true,
  },
  {
    name: "O'Brien is just a name",
    args: [{ name: "O'Brien", city: null, minAge: null, sortBy: "name" }],
    expected: { sql: "SELECT id, name, city, age FROM users WHERE name = @p0 ORDER BY name", params: ["O'Brien"] },
    hidden: true,
  },
];
