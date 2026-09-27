public sealed record Attempt(string Outcome, int DurationMs);

public sealed record RetryPolicy(int MaxAttempts, int BaseDelayMs, int MaxDelayMs, int AttemptTimeoutMs, int TotalBudgetMs);

public sealed record RetryResult(string Outcome, int Attempts, int ElapsedMs, List<string> Events);

public static class Resilience
{
    public static RetryResult Simulate(Attempt[] script, RetryPolicy policy)
    {
        var events = new List<string>();
        var clock = 0;

        for (var n = 1; ; n++)
        {
            var attempt = n <= script.Length ? script[n - 1] : new Attempt("transient", 0);

            if (attempt.DurationMs > policy.AttemptTimeoutMs)
            {
                // A per-attempt timeout caps how long one slow call can hold us.
                clock += policy.AttemptTimeoutMs;
                events.Add($"attempt {n} timed out at {clock}");
            }
            else
            {
                clock += attempt.DurationMs;
                switch (attempt.Outcome)
                {
                    case "ok":
                        events.Add($"attempt {n} ok at {clock}");
                        return new RetryResult("succeeded", n, clock, events);
                    case "fatal":
                        // Retrying a request that can never succeed only adds load.
                        events.Add($"attempt {n} failed (fatal) at {clock}");
                        return new RetryResult("failed", n, clock, events);
                    default:
                        events.Add($"attempt {n} failed (transient) at {clock}");
                        break;
                }
            }

            if (n >= policy.MaxAttempts)
            {
                return new RetryResult("exhausted", n, clock, events);
            }

            var delay = (int)Math.Min((long)policy.BaseDelayMs << (n - 1), policy.MaxDelayMs);
            if (clock + delay >= policy.TotalBudgetMs)
            {
                events.Add($"budget exhausted at {clock}");
                return new RetryResult("budget-exceeded", n, clock, events);
            }

            events.Add($"wait {delay}ms");
            clock += delay;
        }
    }
}
