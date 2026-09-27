public sealed record Order(int Id, decimal Total, string Status);
public sealed record OrderStats(int Count, decimal Sum, decimal Max, List<int> BigOrderIds, int SourceReads);

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
    public static OrderStats Summarize(Order[] orders, decimal bigOrderThreshold)
    {
        var cursor = new OrderCursor(orders);

        // ToList() is the one immediate operator: the source is read here, once.
        var paid = cursor.Rows().Where(order => order.Status == "paid").ToList();

        var count = paid.Count;
        var sum = paid.Sum(order => order.Total);
        var max = paid.Count > 0 ? paid.Max(order => order.Total) : 0m;
        var big = paid.Where(order => order.Total >= bigOrderThreshold).Select(order => order.Id).ToList();

        return new OrderStats(count, sum, max, big, cursor.Reads);
    }
}
