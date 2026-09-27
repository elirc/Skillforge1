import type { TestCase } from "@content/_authoring/types";

export const functionName = "retryPlan";

export const tests: TestCase[] = [
  { name: "succeeds first time, no waits", args: [[true], 3, 100], expected: { ok: true, attempts: 1, waits: [] } },
  { name: "doubles the wait after each failure", args: [[false, false, true], 5, 100], expected: { ok: true, attempts: 3, waits: [100, 200] } },
  { name: "gives up after maxAttempts with no trailing wait", args: [[false, false, false, false], 3, 50], expected: { ok: false, attempts: 3, waits: [50, 100] } },
  { name: "missing outcomes count as failures", args: [[false], 4, 10], expected: { ok: false, attempts: 4, waits: [10, 20, 40] }, hidden: true },
  { name: "a single attempt never waits", args: [[false], 1, 100], expected: { ok: false, attempts: 1, waits: [] }, hidden: true },
];
