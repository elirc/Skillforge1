public sealed record OrderLine(string Sku, int Quantity);
public sealed record Order(string Id, int Priority, List<OrderLine> Lines);
public sealed record StockLevel(string Warehouse, string Sku, int Quantity);
public sealed record Allocation(string OrderId, string Sku, string Warehouse, int Quantity);
public sealed record AllocationResult(List<Allocation> Allocations, List<string> Backordered);

public static class Fulfilment
{
    // Process by Priority desc, then Id. Check the whole order first (all-or-nothing),
    // then fill each line from warehouses in preference order.
    public static AllocationResult Allocate(List<Order> orders, List<StockLevel> stock, List<string> warehousePreference)
    {
        throw new NotImplementedException();
    }
}
