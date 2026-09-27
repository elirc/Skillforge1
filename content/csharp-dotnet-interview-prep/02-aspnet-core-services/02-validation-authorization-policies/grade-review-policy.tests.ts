import type { TestCase } from "@content/_authoring/types";

export const functionName = "Evaluate";

const learner = { UserId: "user-1", Roles: ["learner"] };
const rows = [
  { Id: "rs-1", UserId: "user-1" },
  { Id: "rs-2", UserId: "user-2" },
];
const valid = { ReviewStateId: "rs-1", Grade: 4, ElapsedMs: 3200 };

export const tests: TestCase[] = [
  {
    name: "the owner may grade their own review state",
    args: [learner, valid, rows],
    expected: { Status: 200, Errors: [] },
  },
  {
    name: "an anonymous caller gets 401",
    args: [{ UserId: null, Roles: [] }, valid, rows],
    expected: { Status: 401, Errors: [] },
  },
  {
    name: "a signed-in caller without the learner role gets 403",
    args: [{ UserId: "user-1", Roles: ["guest"] }, valid, rows],
    expected: { Status: 403, Errors: [] },
  },
  {
    name: "reports every validation error at once",
    args: [learner, { ReviewStateId: "rs-1", Grade: 9, ElapsedMs: -1 }, rows],
    expected: { Status: 400, Errors: ["Grade must be between 0 and 5.", "ElapsedMs must not be negative."] },
  },
  {
    name: "another user's review state is 404, not 403",
    args: [learner, { ReviewStateId: "rs-2", Grade: 3, ElapsedMs: 100 }, rows],
    expected: { Status: 404, Errors: [] },
  },
  {
    name: "authentication is checked before validation",
    args: [{ UserId: "", Roles: ["learner"] }, { ReviewStateId: "", Grade: -3, ElapsedMs: 0 }, rows],
    expected: { Status: 401, Errors: [] },
    hidden: true,
  },
  {
    name: "a blank id is a validation error, and grade bounds are inclusive",
    args: [learner, { ReviewStateId: " ", Grade: 5, ElapsedMs: 0 }, rows],
    expected: { Status: 400, Errors: ["ReviewStateId is required."] },
    hidden: true,
  },
  {
    name: "an id that does not exist is 404",
    args: [learner, { ReviewStateId: "rs-404", Grade: 0, ElapsedMs: 0 }, rows],
    expected: { Status: 404, Errors: [] },
    hidden: true,
  },
];
