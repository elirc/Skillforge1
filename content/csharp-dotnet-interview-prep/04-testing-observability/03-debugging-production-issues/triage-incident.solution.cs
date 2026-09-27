public sealed record Deploy(string Version, DateTime At);
public sealed record ErrorSample(DateTime At, double ErrorRate);
public sealed record TriageResult(string Action, string? Suspect, string? RollbackTo);

public static class IncidentTriage
{
    private static readonly TimeSpan SuspectWindow = TimeSpan.FromMinutes(60);

    public static TriageResult Triage(Deploy[] deploys, ErrorSample[] samples, double threshold)
    {
        // Impact first: when did the error rate cross the line?
        var spike = samples.OrderBy(sample => sample.At).FirstOrDefault(sample => sample.ErrorRate > threshold);
        if (spike is null)
        {
            return new TriageResult("none", null, null);
        }

        // What changed recently? The latest deploy at or before the spike.
        var ordered = deploys.OrderBy(deploy => deploy.At).ToList();
        var suspectIndex = ordered.FindLastIndex(deploy => deploy.At <= spike.At);
        if (suspectIndex < 0 || spike.At - ordered[suspectIndex].At > SuspectWindow)
        {
            return new TriageResult("investigate", null, null);
        }

        var suspect = ordered[suspectIndex];
        if (suspectIndex == 0)
        {
            // No known-good version to go back to: switch the feature off instead.
            return new TriageResult("disable-feature", suspect.Version, null);
        }

        return new TriageResult("rollback", suspect.Version, ordered[suspectIndex - 1].Version);
    }
}
