public sealed record Order(int Id, decimal Total, string Status);
public sealed record OrderStats(int Count, decimal Sum, decimal Max, List<int> BigOrderIds, int SourceReads);

// Stands in for a database cursor or an expensive iterator: every time someone
// enumerates Rows(), Reads goes up by one (on the first MoveNext, because
// iterator methods are deferred too).
public sealed class OrderCursor
{
    private readonly Order[] _rows;

    public OrderCursor(Order[] rows) => _rows = rows;

    public int Reads { get; private set; }

    public IEnumerable<Order> Rows()
    {
        Reads++;
        foreach (var row in _rows)
        {
            yield return row;
        }
    }
}

public static class Reports
{
    // Summarize the PAID orders (Status == "paid"):
    //   Count, Sum of Total, Max Total (0 when there are none), and the Ids of
    //   paid orders whose Total is at least bigOrderThreshold, in source order.
    // SourceReads must be exactly 1: read the cursor once, however many
    // statistics you compute.
    public static OrderStats Summarize(Order[] orders, decimal bigOrderThreshold)
    {
        var cursor = new OrderCursor(orders);

        // `paid` is a query, not a list. Every operator below re-runs it.
        var paid = cursor.Rows().Where(order => order.Status == "paid");

        var count = paid.Count();
        var sum = paid.Sum(order => order.Total);
        var max = paid.Any() ? paid.Max(order => order.Total) : 0m;
        var big = paid.Where(order => order.Total >= bigOrderThreshold).Select(order => order.Id).ToList();

        return new OrderStats(count, sum, max, big, cursor.Reads);
    }
}
