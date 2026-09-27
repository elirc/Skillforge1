import type { TestCase } from "@content/_authoring/types";

export const functionName = "verifyWebhook";

const SECRET = "whsec_live";
const BODY = '{"event":"order.paid","orderId":1001}';
const NOW = 1700000060;

export const tests: TestCase[] = [
  { name: "a correctly signed webhook verifies", args: [SECRET, "t=1700000000,v1=9b89f5ce", BODY, NOW], expected: { ok: true } },
  {
    name: "a tampered body fails",
    args: [SECRET, "t=1700000000,v1=9b89f5ce", '{"event":"order.paid","orderId":1002}', NOW],
    expected: { ok: false, reason: "signature mismatch" },
  },
  {
    name: "the wrong secret fails",
    args: ["whsec_guess", "t=1700000000,v1=9b89f5ce", BODY, NOW],
    expected: { ok: false, reason: "signature mismatch" },
  },
  {
    name: "an old timestamp is rejected as a replay",
    args: [SECRET, "t=1700000000,v1=9b89f5ce", BODY, 1700000301],
    expected: { ok: false, reason: "timestamp outside tolerance" },
  },
  {
    name: "any v1 may match during secret rotation",
    args: [SECRET, "t=1700000000,v1=86e1cbb1,v1=9b89f5ce", BODY, NOW],
    expected: { ok: true },
  },
  { name: "a header without v1 is malformed", args: [SECRET, "t=1700000000", BODY, NOW], expected: { ok: false, reason: "malformed signature header" } },
  {
    name: "re-serialized JSON no longer matches the signature",
    args: [SECRET, "t=1700000000,v1=9b89f5ce", '{\n "event": "order.paid",\n "orderId": 1001\n}', NOW],
    expected: { ok: false, reason: "signature mismatch" },
  },
  {
    name: "the timestamp is part of the signed message",
    args: [SECRET, "t=1700000100,v1=9b89f5ce", BODY, NOW],
    expected: { ok: false, reason: "signature mismatch" },
    hidden: true,
  },
  {
    name: "exactly 300 seconds is still inside the tolerance",
    args: [SECRET, "t=1700000100,v1=14f314dd", BODY, 1700000400],
    expected: { ok: true },
    hidden: true,
  },
  {
    name: "a non-numeric timestamp is malformed",
    args: [SECRET, "t=yesterday,v1=9b89f5ce", BODY, NOW],
    expected: { ok: false, reason: "malformed signature header" },
    hidden: true,
  },
];
