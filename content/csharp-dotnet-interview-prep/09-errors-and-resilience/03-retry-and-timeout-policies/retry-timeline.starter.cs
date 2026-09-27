// What each call to the flaky dependency does, in order: Outcome is "ok",
// "transient" (worth retrying: a 503, a dropped connection) or "fatal" (a 400,
// a validation error: retrying cannot help). DurationMs is how long it takes.
public sealed record Attempt(string Outcome, int DurationMs);

public sealed record RetryPolicy(int MaxAttempts, int BaseDelayMs, int MaxDelayMs, int AttemptTimeoutMs, int TotalBudgetMs);

public sealed record RetryResult(string Outcome, int Attempts, int ElapsedMs, List<string> Events);

public static class Resilience
{
    // Simulate a retry policy on a virtual clock that starts at 0 (no real waiting).
    //
    // For attempt n = 1, 2, ... using script[n - 1]:
    // - If DurationMs > AttemptTimeoutMs, the call times out: the clock advances
    //   by AttemptTimeoutMs, log "attempt n timed out at <clock>", and treat it as transient.
    // - Otherwise advance the clock by DurationMs and log:
    //     ok        -> "attempt n ok at <clock>"; Outcome "succeeded"; stop.
    //     fatal     -> "attempt n failed (fatal) at <clock>"; Outcome "failed"; stop. Never retry.
    //     transient -> "attempt n failed (transient) at <clock>"
    // After a transient failure or timeout:
    // - If n == MaxAttempts: Outcome "exhausted"; stop.
    // - delay = min(BaseDelayMs * 2^(n-1), MaxDelayMs)   (exponential backoff with a cap)
    // - If clock + delay >= TotalBudgetMs: log "budget exhausted at <clock>",
    //   Outcome "budget-exceeded"; stop (there is no time left for another try).
    // - Otherwise log "wait <delay>ms", advance the clock by the delay, try again.
    // If the script runs out, treat further attempts as transient with DurationMs 0.
    // Attempts is how many calls were made; ElapsedMs is the final clock.
    public static RetryResult Simulate(Attempt[] script, RetryPolicy policy)
    {
        // Naive: retries everything with a fixed delay and ignores timeouts and the budget.
        var events = new List<string>();
        var clock = 0;
        for (var n = 1; n <= policy.MaxAttempts; n++)
        {
            var attempt = n <= script.Length ? script[n - 1] : new Attempt("transient", 0);
            clock += attempt.DurationMs;
            if (attempt.Outcome == "ok")
            {
                events.Add($"attempt {n} ok at {clock}");
                return new RetryResult("succeeded", n, clock, events);
            }

            events.Add($"attempt {n} failed ({attempt.Outcome}) at {clock}");
            if (n < policy.MaxAttempts)
            {
                events.Add($"wait {policy.BaseDelayMs}ms");
                clock += policy.BaseDelayMs;
            }
        }

        return new RetryResult("exhausted", policy.MaxAttempts, clock, events);
    }
}
