public sealed record CacheOp(int At, string Kind, string Key, string? Value);

public static class CacheAside
{
    // Simulate a cache-aside cache in front of `database`, over a fake clock.
    // `At` is the time in seconds; ops arrive in time order. Return one log line per op.
    //
    // Kind "get":
    //   - HIT when the key is cached and At < cachedAt + ttlSeconds -> "hit {Key}={value}"
    //     (an entry expires exactly at cachedAt + ttlSeconds)
    //   - otherwise MISS: read the database. If the key exists, cache it with
    //     cachedAt = At and log "miss {Key}={value}". If it does not exist, log
    //     "miss {Key}=null" and cache nothing.
    // Kind "write":
    //   - store Value in the database, INVALIDATE (remove) the cached entry,
    //     and log "write {Key}".
    // Ignore any other Kind.
    public static List<string> Simulate(Dictionary<string, string> database, CacheOp[] ops, int ttlSeconds)
    {
        return new List<string>();
    }
}
