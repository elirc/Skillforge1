public sealed record CacheOp(int At, string Kind, string Key, string? Value);

public static class CacheAside
{
    public static List<string> Simulate(Dictionary<string, string> database, CacheOp[] ops, int ttlSeconds)
    {
        var cache = new Dictionary<string, (string Value, int CachedAt)>();
        var log = new List<string>();

        foreach (var op in ops)
        {
            if (op.Kind == "write")
            {
                // Update the source of truth first, then invalidate the cached copy.
                database[op.Key] = op.Value ?? "";
                cache.Remove(op.Key);
                log.Add($"write {op.Key}");
                continue;
            }

            if (op.Kind != "get") continue;

            if (cache.TryGetValue(op.Key, out var entry) && op.At < entry.CachedAt + ttlSeconds)
            {
                log.Add($"hit {op.Key}={entry.Value}");
                continue;
            }

            // Miss or expired: load from the database and repopulate.
            cache.Remove(op.Key);
            if (database.TryGetValue(op.Key, out var value))
            {
                cache[op.Key] = (value, op.At);
                log.Add($"miss {op.Key}={value}");
            }
            else
            {
                log.Add($"miss {op.Key}=null");
            }
        }

        return log;
    }
}
