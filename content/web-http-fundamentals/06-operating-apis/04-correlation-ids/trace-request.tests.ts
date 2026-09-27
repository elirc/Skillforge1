import type { TestCase } from "@content/_authoring/types";

export const functionName = "traceRequest";

const TRACE_ID = "4bf92f3577b34da6a3ce929d0e0e4736";
const TRACEPARENT = `00-${TRACE_ID}-00f067aa0ba902b7-01`;
const GEN = "gen-7f3a";

export const tests: TestCase[] = [
  {
    name: "uses the trace id from a valid traceparent",
    args: [{ traceparent: TRACEPARENT }, GEN],
    expected: { correlationId: TRACE_ID, source: "traceparent", responseHeaders: { "X-Correlation-Id": TRACE_ID } },
  },
  {
    name: "falls back to a safe X-Correlation-Id",
    args: [{ "x-correlation-id": "checkout-9f2c" }, GEN],
    expected: { correlationId: "checkout-9f2c", source: "header", responseHeaders: { "X-Correlation-Id": "checkout-9f2c" } },
  },
  {
    name: "generates an id when none is sent",
    args: [{}, GEN],
    expected: { correlationId: GEN, source: "generated", responseHeaders: { "X-Correlation-Id": GEN } },
  },
  {
    name: "traceparent wins over X-Correlation-Id",
    args: [{ traceparent: TRACEPARENT, "x-correlation-id": "abc" }, GEN],
    expected: { correlationId: TRACE_ID, source: "traceparent", responseHeaders: { "X-Correlation-Id": TRACE_ID } },
  },
  {
    name: "rejects a correlation id that could forge log lines",
    args: [{ "x-correlation-id": "abc\nlevel=error user=admin" }, GEN],
    expected: { correlationId: GEN, source: "generated", responseHeaders: { "X-Correlation-Id": GEN } },
  },
  {
    name: "an all-zero trace id is invalid",
    args: [{ traceparent: "00-00000000000000000000000000000000-00f067aa0ba902b7-01", "x-correlation-id": "req-1" }, GEN],
    expected: { correlationId: "req-1", source: "header", responseHeaders: { "X-Correlation-Id": "req-1" } },
  },
  {
    name: "uppercase hex in traceparent is invalid",
    args: [{ traceparent: `00-${TRACE_ID.toUpperCase()}-00f067aa0ba902b7-01` }, GEN],
    expected: { correlationId: GEN, source: "generated", responseHeaders: { "X-Correlation-Id": GEN } },
    hidden: true,
  },
  {
    name: "a 65-character id is too long",
    args: [{ "x-correlation-id": "a".repeat(65) }, GEN],
    expected: { correlationId: GEN, source: "generated", responseHeaders: { "X-Correlation-Id": GEN } },
    hidden: true,
  },
];
