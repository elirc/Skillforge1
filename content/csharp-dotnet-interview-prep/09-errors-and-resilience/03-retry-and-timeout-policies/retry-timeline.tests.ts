import type { TestCase } from "@content/_authoring/types";

export const functionName = "Simulate";

const at = (Outcome: string, DurationMs: number) => ({ Outcome, DurationMs });

const policy = (overrides: Record<string, number> = {}) => ({
  MaxAttempts: 4,
  BaseDelayMs: 100,
  MaxDelayMs: 300,
  AttemptTimeoutMs: 1000,
  TotalBudgetMs: 5000,
  ...overrides,
});

export const tests: TestCase[] = [
  {
    name: "transient failures back off exponentially, then succeed",
    args: [[at("transient", 50), at("transient", 50), at("ok", 20)], policy()],
    expected: {
      Outcome: "succeeded",
      Attempts: 3,
      ElapsedMs: 420,
      Events: [
        "attempt 1 failed (transient) at 50",
        "wait 100ms",
        "attempt 2 failed (transient) at 200",
        "wait 200ms",
        "attempt 3 ok at 420",
      ],
    },
  },
  {
    name: "a fatal error is never retried",
    args: [[at("transient", 10), at("fatal", 10), at("ok", 10)], policy()],
    expected: {
      Outcome: "failed",
      Attempts: 2,
      ElapsedMs: 120,
      Events: ["attempt 1 failed (transient) at 10", "wait 100ms", "attempt 2 failed (fatal) at 120"],
    },
  },
  {
    name: "a slow call is cut off by the per-attempt timeout",
    args: [[at("ok", 1500), at("ok", 30)], policy()],
    expected: {
      Outcome: "succeeded",
      Attempts: 2,
      ElapsedMs: 1130,
      Events: ["attempt 1 timed out at 1000", "wait 100ms", "attempt 2 ok at 1130"],
    },
  },
  {
    name: "the delay is capped and attempts run out",
    args: [[], policy()],
    expected: {
      Outcome: "exhausted",
      Attempts: 4,
      ElapsedMs: 600,
      Events: [
        "attempt 1 failed (transient) at 0",
        "wait 100ms",
        "attempt 2 failed (transient) at 100",
        "wait 200ms",
        "attempt 3 failed (transient) at 300",
        "wait 300ms",
        "attempt 4 failed (transient) at 600",
      ],
    },
  },
  {
    name: "the total budget stops retries that could not finish in time",
    args: [[at("transient", 300), at("ok", 800), at("ok", 10)], policy({ AttemptTimeoutMs: 400, TotalBudgetMs: 1000 })],
    expected: {
      Outcome: "budget-exceeded",
      Attempts: 2,
      ElapsedMs: 800,
      Events: ["attempt 1 failed (transient) at 300", "wait 100ms", "attempt 2 timed out at 800", "budget exhausted at 800"],
    },
  },
  {
    name: "first-try success",
    args: [[at("ok", 5)], policy()],
    expected: { Outcome: "succeeded", Attempts: 1, ElapsedMs: 5, Events: ["attempt 1 ok at 5"] },
  },
  {
    name: "a single allowed attempt is exhausted immediately",
    args: [[at("transient", 10), at("ok", 1)], policy({ MaxAttempts: 1 })],
    expected: { Outcome: "exhausted", Attempts: 1, ElapsedMs: 10, Events: ["attempt 1 failed (transient) at 10"] },
    hidden: true,
  },
  {
    name: "a timed-out call is transient even if it would have been fatal",
    args: [[at("fatal", 2000), at("ok", 1)], policy()],
    expected: {
      Outcome: "succeeded",
      Attempts: 2,
      ElapsedMs: 1101,
      Events: ["attempt 1 timed out at 1000", "wait 100ms", "attempt 2 ok at 1101"],
    },
    hidden: true,
  },
];
