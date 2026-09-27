public sealed record Deploy(string Version, DateTime At);
public sealed record ErrorSample(DateTime At, double ErrorRate);
public sealed record TriageResult(string Action, string? Suspect, string? RollbackTo);

public static class IncidentTriage
{
    // Turn deploy history and an error-rate metric into a first mitigation step.
    // Neither array is guaranteed to be sorted.
    //
    //   1. The spike is the EARLIEST sample whose ErrorRate is strictly greater
    //      than threshold. No spike -> ("none", null, null).
    //   2. The suspect is the latest deploy at or before the spike. If there is none,
    //      or it happened more than 60 minutes before the spike, the deploy is
    //      probably not the cause -> ("investigate", null, null).
    //   3. If the suspect is the very first deploy there is no known-good version
    //      to roll back to -> ("disable-feature", suspect, null).
    //   4. Otherwise roll back to the deploy right before the suspect
    //      -> ("rollback", suspect, previousVersion).
    public static TriageResult Triage(Deploy[] deploys, ErrorSample[] samples, double threshold)
    {
        return new TriageResult("none", null, null);
    }
}
