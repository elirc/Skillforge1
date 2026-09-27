public sealed record OutboxMessage(string Id, int CreatedAt);

public static class OutboxDispatcher
{
    private sealed class Pending
    {
        public required OutboxMessage Message { get; init; }
        public int Attempts { get; set; }
        public int NextAttemptAt { get; set; }
    }

    public static List<string> Dispatch(List<OutboxMessage> messages, List<string> failingAttempts, int batchSize, int maxAttempts)
    {
        var failing = new HashSet<string>(failingAttempts);
        var pending = messages
            .Select(message => new Pending { Message = message, NextAttemptAt = message.CreatedAt })
            .ToList();
        var log = new List<string>();
        var lastTick = int.MinValue;

        while (pending.Count > 0)
        {
            var earliest = pending.Min(p => p.NextAttemptAt);
            var t = lastTick == int.MinValue ? earliest : Math.Max(lastTick + 1, earliest);
            lastTick = t;

            var batch = pending
                .Where(p => p.NextAttemptAt <= t)
                .OrderBy(p => p.Message.CreatedAt)
                .ThenBy(p => p.Message.Id, StringComparer.Ordinal)
                .Take(batchSize)
                .ToList();

            foreach (var item in batch)
            {
                item.Attempts++;
                var id = item.Message.Id;

                if (!failing.Contains($"{id}#{item.Attempts}"))
                {
                    log.Add($"t={t} sent {id}");
                    pending.Remove(item);
                }
                else if (item.Attempts >= maxAttempts)
                {
                    log.Add($"t={t} dead {id}");
                    pending.Remove(item);
                }
                else
                {
                    item.NextAttemptAt = t + (1 << (item.Attempts - 1));
                    log.Add($"t={t} retry {id} at {item.NextAttemptAt}");
                }
            }
        }

        return log;
    }
}
