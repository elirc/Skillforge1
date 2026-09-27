import type { TestCase } from "@content/_authoring/types";

export const functionName = "decodeJwt";

const HS256 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"; // {"alg":"HS256","typ":"JWT"}
const HEADER = { alg: "HS256", typ: "JWT" };
const NOW = 1700001800;

export const tests: TestCase[] = [
  {
    name: "decodes the header and payload of a live token",
    args: [`${HS256}.eyJzdWIiOiI0MiIsIm5hbWUiOiJBZGEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.sig`, NOW],
    expected: { ok: true, header: HEADER, payload: { sub: "42", name: "Ada", role: "admin", iat: 1700000000, exp: 1700003600 } },
  },
  {
    name: "an expired token is rejected",
    args: [`${HS256}.eyJzdWIiOiI3IiwiZXhwIjoxNzAwMDAwMDAwfQ.sig`, NOW],
    expected: { ok: false, reason: "expired" },
  },
  {
    name: "alg none is refused",
    args: ["eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIn0.", NOW],
    expected: { ok: false, reason: "alg none is not allowed" },
  },
  {
    name: "a token used before nbf is not yet valid",
    args: [`${HS256}.eyJzdWIiOiI5IiwibmJmIjoxNzAwMDAxMDAwfQ.sig`, 1700000500],
    expected: { ok: false, reason: "not yet valid" },
  },
  {
    name: "two segments is malformed",
    args: [`${HS256}.eyJzdWIiOiIzIn0`, NOW],
    expected: { ok: false, reason: "malformed" },
  },
  {
    name: "handles the URL-safe characters - and _",
    args: [`${HS256}.eyJzdWIiOiI4Iiwibm90ZSI6ImE_Yj5jIn0.sig`, NOW],
    expected: { ok: true, header: HEADER, payload: { sub: "8", note: "a?b>c" } },
  },
  {
    name: "a segment that is not JSON is malformed",
    args: ["bm90IGpzb24.eyJhIjoxfQ.x", NOW],
    expected: { ok: false, reason: "malformed" },
  },
  {
    name: "decodes multi-byte UTF-8",
    args: [`${HS256}.eyJzdWIiOiI1IiwibmFtZSI6Ilpvw6sgTcO8bGxlciJ9.sig`, NOW],
    expected: { ok: true, header: HEADER, payload: { sub: "5", name: "Zoë Müller" } },
    hidden: true,
  },
  {
    name: "expiry is inclusive: now === exp is expired",
    args: [`${HS256}.eyJzdWIiOiI3IiwiZXhwIjoxNzAwMDAwMDAwfQ.sig`, 1700000000],
    expected: { ok: false, reason: "expired" },
    hidden: true,
  },
  {
    name: "tolerates trailing = padding",
    args: ["eyJhbGciOiJIUzI1NiJ9=.eyJzdWIiOiJwIn0.s", NOW],
    expected: { ok: true, header: { alg: "HS256" }, payload: { sub: "p" } },
    hidden: true,
  },
];
