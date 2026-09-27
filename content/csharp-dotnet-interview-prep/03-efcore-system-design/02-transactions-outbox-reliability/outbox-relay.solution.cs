public sealed record OutboxRow(string Id, long Sequence, bool Processed);
public sealed record RelayResult(List<string> Delivered, List<string> Handled);

public static class OutboxRelay
{
    public static RelayResult RunRelay(OutboxRow[] rows, int crashAfterPublishes)
    {
        var processed = rows.Where(row => row.Processed).Select(row => row.Id).ToHashSet();
        var pending = rows.Where(row => !row.Processed).OrderBy(row => row.Sequence).ToList();
        var delivered = new List<string>();

        // First run: publish, then mark processed. A crash between the two steps
        // leaves the row unprocessed even though the broker already has it.
        var published = 0;
        foreach (var row in pending)
        {
            delivered.Add(row.Id);
            published++;
            if (published == crashAfterPublishes) break;
            processed.Add(row.Id);
        }

        // After a restart the relay picks up every row that is still unprocessed.
        foreach (var row in pending)
        {
            if (processed.Contains(row.Id)) continue;
            delivered.Add(row.Id);
            processed.Add(row.Id);
        }

        // Delivery is at-least-once, so the consumer dedupes by message id.
        var handled = delivered.Distinct().ToList();
        return new RelayResult(delivered, handled);
    }
}
