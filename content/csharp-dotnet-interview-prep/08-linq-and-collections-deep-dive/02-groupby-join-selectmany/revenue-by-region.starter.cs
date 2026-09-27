public sealed record Customer(string Id, string Name, string Region);
public sealed record OrderLine(string Sku, int Quantity, decimal UnitPrice);
public sealed record Order(string Id, string CustomerId, OrderLine[] Lines);

public sealed record RegionRevenue(string Region, int Customers, int CustomersWithoutOrders, int Orders, int Units, decimal Revenue);
public sealed record SkuUnits(string Sku, int Units);
public sealed record SalesReport(List<RegionRevenue> Regions, List<SkuUnits> TopSkus, List<string> OrphanOrderIds);

public static class Sales
{
    // Build a sales report with Join, GroupJoin, SelectMany and GroupBy.
    //
    // Regions: one row per region that has at least one customer.
    //   Customers              - customers in the region
    //   CustomersWithoutOrders - of those, how many have no orders (GroupJoin)
    //   Orders                 - orders placed by the region's customers
    //   Units / Revenue        - summed over those orders' lines (Quantity, Quantity * UnitPrice)
    //   Order by Revenue descending, then Region (ordinal).
    // TopSkus: across orders that belong to a KNOWN customer, total Units per Sku;
    //   the top 3 by Units descending, then Sku (ordinal).
    // OrphanOrderIds: orders whose CustomerId matches no customer (an inner Join
    //   silently drops these, so report them), ordered by Id (ordinal).
    public static SalesReport Build(Customer[] customers, Order[] orders)
    {
        var regions = customers
            .GroupBy(customer => customer.Region)
            .Select(group => new RegionRevenue(group.Key, group.Count(), 0, 0, 0, 0m))
            .ToList();

        return new SalesReport(regions, new List<SkuUnits>(), new List<string>());
    }
}
