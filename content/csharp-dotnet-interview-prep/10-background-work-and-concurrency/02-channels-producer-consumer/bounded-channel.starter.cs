public sealed record ChannelRun(List<string> Consumed, List<string> Dropped, List<string> Log);

public static class BoundedChannelModel
{
    // Model a Channel.CreateBounded<string>(capacity) step by step, synchronously,
    // so the behaviour of each BoundedChannelFullMode is easy to see.
    //
    // Script entries:
    //   "write:X"  - the producer writes item X
    //   "read"     - the consumer reads one item
    //   "complete" - the producer calls Writer.Complete()
    //
    // write:X
    //   after completion              -> log "rejected X" (nothing else happens)
    //   buffer has room               -> enqueue X, log "wrote X"
    //   buffer full, by fullMode:
    //     "Wait"       -> the producer is blocked: X waits in a FIFO of blocked
    //                     writers, log "blocked X"
    //     "DropOldest" -> remove the OLDEST buffered item (add it to Dropped,
    //                     log "dropped <item>"), then enqueue X, log "wrote X"
    //     "DropNewest" -> remove the NEWEST buffered item (add to Dropped, log
    //                     "dropped <item>"), then enqueue X, log "wrote X"
    //     "DropWrite"  -> discard X itself: add X to Dropped, log "dropped X"
    // read
    //   buffer not empty -> dequeue, add to Consumed, log "read X"; then if a
    //                       writer is blocked, move its item into the buffer and
    //                       log "unblocked Y"
    //   buffer empty     -> log "read: completed" after completion, otherwise
    //                       "read: empty"
    // complete
    //   the first time: log "complete", then every still-blocked writer fails:
    //   log "rejected Y" for each, oldest first. Later completes do nothing.
    //   Items already in the buffer can still be read after completion.
    public static ChannelRun Simulate(int capacity, string fullMode, string[] script)
    {
        // Unbounded: ignores capacity and fullMode, so memory grows without limit.
        var buffer = new Queue<string>();
        var consumed = new List<string>();
        var log = new List<string>();
        foreach (var entry in script)
        {
            if (entry.StartsWith("write:"))
            {
                var item = entry["write:".Length..];
                buffer.Enqueue(item);
                log.Add($"wrote {item}");
            }
            else if (entry == "read" && buffer.Count > 0)
            {
                var item = buffer.Dequeue();
                consumed.Add(item);
                log.Add($"read {item}");
            }
        }

        return new ChannelRun(consumed, new List<string>(), log);
    }
}
