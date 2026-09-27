using System.Collections.Concurrent;

public sealed record HitReport(List<string> Counts, int Total, int LongestPath);

public static class HitCounter
{
    public static HitReport Count(string[] requests)
    {
        var counts = new ConcurrentDictionary<string, int>(StringComparer.Ordinal);
        var total = 0;
        var longest = 0;
        var gate = new object();

        Parallel.ForEach(requests, new ParallelOptions { MaxDegreeOfParallelism = 4 }, request =>
        {
            var path = Normalize(request);
            if (path is null)
            {
                return;
            }

            // Atomic per key. (The update delegate may run more than once under
            // contention, so it must be a pure function of its inputs.)
            counts.AddOrUpdate(path, 1, (_, current) => current + 1);

            // `total++` is read-modify-write: two threads can read the same value.
            Interlocked.Increment(ref total);

            // Compare-then-write is two steps, so it needs a lock (or a CAS loop).
            lock (gate)
            {
                if (path.Length > longest)
                {
                    longest = path.Length;
                }
            }
        });

        var ordered = counts
            .OrderByDescending(pair => pair.Value)
            .ThenBy(pair => pair.Key, StringComparer.Ordinal)
            .Select(pair => $"{pair.Key}={pair.Value}")
            .ToList();

        return new HitReport(ordered, total, longest);
    }

    private static string? Normalize(string request)
    {
        var path = request.Trim();
        if (path.Length == 0)
        {
            return null;
        }

        var query = path.IndexOf('?');
        if (query >= 0)
        {
            path = path[..query];
        }

        path = path.ToLowerInvariant();
        if (path.Length > 1 && path.EndsWith('/'))
        {
            path = path[..^1];
        }

        return path;
    }
}
