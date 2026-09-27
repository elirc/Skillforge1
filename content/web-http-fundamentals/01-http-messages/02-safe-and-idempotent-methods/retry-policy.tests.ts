import type { TestCase } from "@content/_authoring/types";

export const functionName = "retryPolicy";

export const tests: TestCase[] = [
  { name: "GET is safe and idempotent", args: [{ method: "GET", headers: {} }], expected: { safe: true, idempotent: true, autoRetry: true } },
  { name: "PUT is idempotent but not safe", args: [{ method: "PUT", headers: {} }], expected: { safe: false, idempotent: true, autoRetry: true } },
  { name: "DELETE is idempotent but not safe", args: [{ method: "DELETE", headers: {} }], expected: { safe: false, idempotent: true, autoRetry: true } },
  {
    name: "a plain POST must not be retried",
    args: [{ method: "POST", headers: { "Content-Type": "application/json" } }],
    expected: { safe: false, idempotent: false, autoRetry: false },
  },
  {
    name: "a POST with an Idempotency-Key may be retried",
    args: [{ method: "POST", headers: { "Idempotency-Key": "7f3c-11" } }],
    expected: { safe: false, idempotent: false, autoRetry: true },
  },
  { name: "method names are case-insensitive", args: [{ method: "head", headers: {} }], expected: { safe: true, idempotent: true, autoRetry: true } },
  {
    name: "header names are case-insensitive",
    args: [{ method: "PATCH", headers: { "idempotency-key": "abc" } }],
    expected: { safe: false, idempotent: false, autoRetry: true },
  },
  {
    name: "a blank key does not count",
    args: [{ method: "POST", headers: { "Idempotency-Key": "   " } }],
    expected: { safe: false, idempotent: false, autoRetry: false },
    hidden: true,
  },
  {
    name: "the key only helps POST and PATCH",
    args: [{ method: "CONNECT", headers: { "Idempotency-Key": "k" } }],
    expected: { safe: false, idempotent: false, autoRetry: false },
    hidden: true,
  },
];
