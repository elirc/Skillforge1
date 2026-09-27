public sealed record OutboxMessage(string Id, int CreatedAt);

public static class OutboxDispatcher
{
    // Each tick: take up to batchSize due messages (CreatedAt, then Id), try them,
    // log "sent", "retry ... at ..." (backoff 2^(attempt-1)) or "dead".
    public static List<string> Dispatch(List<OutboxMessage> messages, List<string> failingAttempts, int batchSize, int maxAttempts)
    {
        throw new NotImplementedException();
    }
}
