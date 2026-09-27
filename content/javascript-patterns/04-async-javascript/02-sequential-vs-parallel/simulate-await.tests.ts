import type { TestCase } from "@content/_authoring/types";

export const functionName = "simulateAwait";

const three = [
  { ms: 100, ok: true, value: "user" },
  { ms: 300, ok: true, value: "orders" },
  { ms: 200, ok: true, value: "prefs" },
];

const withFailure = [
  { ms: 100, ok: true, value: "user" },
  { ms: 300, ok: false, value: "orders down" },
  { ms: 50, ok: false, value: "prefs down" },
];

export const tests: TestCase[] = [
  { name: "sequential awaits add up", args: [three, "sequential"], expected: { status: "fulfilled", value: ["user", "orders", "prefs"], at: 600 } },
  { name: "Promise.all waits for the slowest", args: [three, "parallel"], expected: { status: "fulfilled", value: ["user", "orders", "prefs"], at: 300 } },
  { name: "sequential stops at the first failure in order", args: [withFailure, "sequential"], expected: { status: "rejected", reason: "orders down", at: 400 } },
  { name: "Promise.all rejects with the earliest failure in time", args: [withFailure, "parallel"], expected: { status: "rejected", reason: "prefs down", at: 50 } },
  { name: "no tasks settle immediately", args: [[], "parallel"], expected: { status: "fulfilled", value: [], at: 0 }, hidden: true },
  { name: "empty sequential list", args: [[], "sequential"], expected: { status: "fulfilled", value: [], at: 0 }, hidden: true },
];
