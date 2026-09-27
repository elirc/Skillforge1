public sealed record ChannelRun(List<string> Consumed, List<string> Dropped, List<string> Log);

public static class BoundedChannelModel
{
    public static ChannelRun Simulate(int capacity, string fullMode, string[] script)
    {
        var buffer = new LinkedList<string>();
        var blockedWriters = new Queue<string>();
        var consumed = new List<string>();
        var dropped = new List<string>();
        var log = new List<string>();
        var completed = false;

        foreach (var entry in script)
        {
            if (entry.StartsWith("write:"))
            {
                var item = entry["write:".Length..];
                if (completed)
                {
                    log.Add($"rejected {item}");
                }
                else if (buffer.Count < capacity)
                {
                    buffer.AddLast(item);
                    log.Add($"wrote {item}");
                }
                else
                {
                    switch (fullMode)
                    {
                        case "Wait":
                            // Backpressure: the producer slows to the consumer's pace.
                            blockedWriters.Enqueue(item);
                            log.Add($"blocked {item}");
                            break;
                        case "DropOldest":
                            DropNode(buffer.First!);
                            buffer.AddLast(item);
                            log.Add($"wrote {item}");
                            break;
                        case "DropNewest":
                            DropNode(buffer.Last!);
                            buffer.AddLast(item);
                            log.Add($"wrote {item}");
                            break;
                        default: // DropWrite
                            dropped.Add(item);
                            log.Add($"dropped {item}");
                            break;
                    }
                }
            }
            else if (entry == "read")
            {
                if (buffer.Count > 0)
                {
                    var item = buffer.First!.Value;
                    buffer.RemoveFirst();
                    consumed.Add(item);
                    log.Add($"read {item}");

                    if (blockedWriters.Count > 0)
                    {
                        var waiting = blockedWriters.Dequeue();
                        buffer.AddLast(waiting);
                        log.Add($"unblocked {waiting}");
                    }
                }
                else
                {
                    log.Add(completed ? "read: completed" : "read: empty");
                }
            }
            else if (entry == "complete" && !completed)
            {
                completed = true;
                log.Add("complete");
                while (blockedWriters.Count > 0)
                {
                    log.Add($"rejected {blockedWriters.Dequeue()}");
                }
            }
        }

        return new ChannelRun(consumed, dropped, log);

        void DropNode(LinkedListNode<string> node)
        {
            buffer.Remove(node);
            dropped.Add(node.Value);
            log.Add($"dropped {node.Value}");
        }
    }
}
