import type { TestCase } from "@content/_authoring/types";

export const functionName = "checkConstraints";

const users = [
  { id: 1, email: "ada@example.com", age: 36, teamId: 10 },
  { id: 2, email: "bo@example.com", age: null, teamId: null },
];

const teams = [
  { id: 10, name: "Platform" },
  { id: 20, name: "Payments" },
];

export const tests: TestCase[] = [
  { name: "a valid row is accepted", args: [users, teams, { id: 3, email: "cy@example.com", age: 28, teamId: 20 }], expected: null },
  { name: "a duplicate id violates the primary key", args: [users, teams, { id: 2, email: "new@example.com", age: 20, teamId: null }], expected: "PK_users" },
  { name: "a NULL email violates NOT NULL", args: [users, teams, { id: 3, email: null, age: 20, teamId: null }], expected: "NN_users_email" },
  { name: "a reused email violates UNIQUE", args: [users, teams, { id: 3, email: "ada@example.com", age: 20, teamId: null }], expected: "UQ_users_email" },
  { name: "a negative age violates the CHECK", args: [users, teams, { id: 3, email: "cy@example.com", age: -1, teamId: null }], expected: "CK_users_age" },
  { name: "a missing team violates the foreign key", args: [users, teams, { id: 3, email: "cy@example.com", age: 5, teamId: 99 }], expected: "FK_users_team" },
  {
    name: "NULL age passes the CHECK and NULL team_id skips the foreign key",
    args: [users, teams, { id: 3, email: "cy@example.com", age: null, teamId: null }],
    expected: null,
    hidden: true,
  },
  { name: "a NULL id violates the primary key", args: [users, teams, { id: null, email: "cy@example.com", age: 1, teamId: null }], expected: "PK_users", hidden: true },
  {
    name: "the first violation in order wins",
    args: [users, teams, { id: 1, email: null, age: -5, teamId: 99 }],
    expected: "PK_users",
    hidden: true,
  },
];
