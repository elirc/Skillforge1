import type { TestCase } from "@content/_authoring/types";

export const functionName = "pickStatus";

export const tests: TestCase[] = [
  { name: "a successful create is 201 Created", args: [{ operation: "create", result: "ok" }], expected: 201 },
  { name: "a successful read is 200 OK", args: [{ operation: "read", result: "ok" }], expected: 200 },
  { name: "a successful delete is 204 No Content", args: [{ operation: "delete", result: "ok" }], expected: 204 },
  { name: "an update that returns the resource is 200", args: [{ operation: "update", result: "ok", returnsBody: true }], expected: 200 },
  { name: "an update with no body is 204", args: [{ operation: "update", result: "ok", returnsBody: false }], expected: 204 },
  { name: "missing credentials is 401", args: [{ operation: "read", result: "unauthenticated" }], expected: 401 },
  { name: "a duplicate email on create is 409", args: [{ operation: "create", result: "conflict" }], expected: 409 },
  { name: "a stale If-Match on update is 412", args: [{ operation: "update", result: "precondition-failed" }], expected: 412, hidden: true },
  { name: "forbidden beats the operation", args: [{ operation: "delete", result: "forbidden" }], expected: 403, hidden: true },
  { name: "an update without returnsBody is 204", args: [{ operation: "update", result: "ok" }], expected: 204, hidden: true },
];
