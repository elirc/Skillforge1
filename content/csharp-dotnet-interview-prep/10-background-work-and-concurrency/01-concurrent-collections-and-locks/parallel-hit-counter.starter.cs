using System.Collections.Concurrent;

public sealed record HitReport(List<string> Counts, int Total, int LongestPath);

public static class HitCounter
{
    // Count request paths from an access log, processing lines IN PARALLEL.
    //
    // Normalize each line: trim it, drop any query string (from the first "?"),
    // lower-case it, and remove a trailing "/" unless the path is just "/".
    // Lines that are blank after trimming are ignored entirely.
    //
    // Run the loop with Parallel.ForEach and make every shared update safe:
    // - per-path counts in a ConcurrentDictionary (AddOrUpdate is atomic per key)
    // - Total (lines counted) with Interlocked.Increment
    // - LongestPath (the longest normalized path length, 0 if none) under a lock,
    //   because "compare, then write" is two steps
    //
    // Counts: "path=count", ordered by count descending, then path (ordinal).
    public static HitReport Count(string[] requests)
    {
        // Sequential, un-normalized, and unordered. Wrapping THIS body in
        // Parallel.ForEach as-is would race on the Dictionary and on `total`.
        var counts = new Dictionary<string, int>();
        var total = 0;
        var longest = 0;
        foreach (var request in requests)
        {
            counts[request] = counts.GetValueOrDefault(request) + 1;
            total++;
            if (request.Length > longest) longest = request.Length;
        }

        return new HitReport(counts.Select(pair => $"{pair.Key}={pair.Value}").ToList(), total, longest);
    }
}
