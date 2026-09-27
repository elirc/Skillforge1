import type { TestCase } from "@content/_authoring/types";

export const functionName = "authorizeRequest";

const alice = { id: 1, roles: ["user"] };
const bob = { id: 2, roles: ["user"] };
const admin = { id: 9, roles: ["user", "admin"] };
const publicNote = { ownerId: 1, visibility: "public" };
const privateNote = { ownerId: 1, visibility: "private" };

export const tests: TestCase[] = [
  { name: "anyone can read a public note", args: [null, "read", publicNote], expected: 200 },
  { name: "signed out and editing is 401", args: [null, "update", publicNote], expected: 401 },
  { name: "the owner can delete their note", args: [alice, "delete", privateNote], expected: 200 },
  { name: "another user editing a public note is 403", args: [bob, "update", publicNote], expected: 403 },
  { name: "another user reading a private note is 404", args: [bob, "read", privateNote], expected: 404 },
  { name: "an admin can delete anything", args: [admin, "delete", privateNote], expected: 200 },
  { name: "signed out and reading a private note is 401", args: [null, "read", privateNote], expected: 401 },
  { name: "another user deleting a private note is 404, not 403", args: [bob, "delete", privateNote], expected: 404, hidden: true },
  { name: "another user can read a public note", args: [bob, "read", publicNote], expected: 200, hidden: true },
];
