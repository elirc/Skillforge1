public sealed record OrderLine(string Sku, int Quantity);
public sealed record Order(string Id, int Priority, List<OrderLine> Lines);
public sealed record StockLevel(string Warehouse, string Sku, int Quantity);
public sealed record Allocation(string OrderId, string Sku, string Warehouse, int Quantity);
public sealed record AllocationResult(List<Allocation> Allocations, List<string> Backordered);

public static class Fulfilment
{
    public static AllocationResult Allocate(List<Order> orders, List<StockLevel> stock, List<string> warehousePreference)
    {
        var onHand = stock
            .GroupBy(row => (row.Warehouse, row.Sku))
            .ToDictionary(group => group.Key, group => group.Sum(row => row.Quantity));

        int Available(string warehouse, string sku) =>
            onHand.TryGetValue((warehouse, sku), out var quantity) ? quantity : 0;

        var allocations = new List<Allocation>();
        var backordered = new List<string>();

        var queue = orders
            .OrderByDescending(order => order.Priority)
            .ThenBy(order => order.Id, StringComparer.Ordinal);

        foreach (var order in queue)
        {
            var coverable = order.Lines
                .GroupBy(line => line.Sku)
                .All(group => warehousePreference.Sum(w => Available(w, group.Key)) >= group.Sum(line => line.Quantity));

            if (!coverable)
            {
                backordered.Add(order.Id);
                continue;
            }

            foreach (var line in order.Lines)
            {
                var remaining = line.Quantity;
                foreach (var warehouse in warehousePreference)
                {
                    if (remaining == 0) break;
                    var take = Math.Min(remaining, Available(warehouse, line.Sku));
                    if (take == 0) continue;
                    onHand[(warehouse, line.Sku)] -= take;
                    remaining -= take;
                    allocations.Add(new Allocation(order.Id, line.Sku, warehouse, take));
                }
            }
        }

        return new AllocationResult(allocations, backordered);
    }
}
