import type { TestCase } from "@content/_authoring/types";

export const functionName = "interpretResponse";

export const tests: TestCase[] = [
  {
    name: "200 with a valid todo",
    args: [{ status: 200, body: { id: 1, title: "Ship", done: false } }],
    expected: { kind: "ok", data: { id: 1, title: "Ship", done: false } },
  },
  {
    name: "201 strips extra fields",
    args: [{ status: 201, body: { id: 2, title: "New", done: false, internal_rev: 9 } }],
    expected: { kind: "ok", data: { id: 2, title: "New", done: false } },
  },
  {
    name: "200 with a malformed body is an error",
    args: [{ status: 200, body: { id: "1", title: "Ship", done: false } }],
    expected: { kind: "error", message: "Malformed response body", retryable: false },
  },
  { name: "404 is not-found", args: [{ status: 404, body: null }], expected: { kind: "not-found" } },
  { name: "403 is unauthorized", args: [{ status: 403, body: {} }], expected: { kind: "unauthorized" } },
  {
    name: "422 exposes field errors",
    args: [{ status: 422, body: { errors: { title: "Title is required" } } }],
    expected: { kind: "invalid", fieldErrors: { title: "Title is required" } },
  },
  {
    name: "503 is retryable and uses the server message",
    args: [{ status: 503, body: { message: "Maintenance" } }],
    expected: { kind: "error", message: "Maintenance", retryable: true },
  },
  {
    name: "500 with no message gets a generic one",
    args: [{ status: 500, body: "<html>" }],
    expected: { kind: "error", message: "Server error (500)", retryable: true },
    hidden: true,
  },
  {
    name: "429 is retryable",
    args: [{ status: 429, body: null }],
    expected: { kind: "error", message: "Server error (429)", retryable: true },
    hidden: true,
  },
  {
    name: "422 with a malformed errors map",
    args: [{ status: 422, body: { errors: { title: 3 } } }],
    expected: { kind: "invalid", fieldErrors: {} },
    hidden: true,
  },
  {
    name: "an unexpected status is not retryable",
    args: [{ status: 409, body: null }],
    expected: { kind: "error", message: "Unexpected status 409", retryable: false },
    hidden: true,
  },
];
