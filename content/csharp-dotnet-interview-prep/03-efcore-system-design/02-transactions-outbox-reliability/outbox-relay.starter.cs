public sealed record OutboxRow(string Id, long Sequence, bool Processed);
public sealed record RelayResult(List<string> Delivered, List<string> Handled);

public static class OutboxRelay
{
    // Simulate an outbox relay (the background worker that ships committed
    // outbox rows to a message broker) and an idempotent consumer.
    //
    // First run:
    //   - take the rows that are not Processed, ordered by Sequence;
    //   - for each one: publish it (append its Id to Delivered), THEN mark it processed;
    //   - if crashAfterPublishes > 0, the relay crashes right after its Nth publish,
    //     BEFORE marking that row processed. (0 means it never crashes.)
    // Restart:
    //   - publish every row that is still not processed, in Sequence order.
    //
    // Handled is what an idempotent consumer actually acts on: each message id
    // once, in the order it first arrived.
    public static RelayResult RunRelay(OutboxRow[] rows, int crashAfterPublishes)
    {
        return new RelayResult(new List<string>(), new List<string>());
    }
}
