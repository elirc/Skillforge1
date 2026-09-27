public sealed record Customer(string Id, string Name, string Region);
public sealed record OrderLine(string Sku, int Quantity, decimal UnitPrice);
public sealed record Order(string Id, string CustomerId, OrderLine[] Lines);

public sealed record RegionRevenue(string Region, int Customers, int CustomersWithoutOrders, int Orders, int Units, decimal Revenue);
public sealed record SkuUnits(string Sku, int Units);
public sealed record SalesReport(List<RegionRevenue> Regions, List<SkuUnits> TopSkus, List<string> OrphanOrderIds);

public static class Sales
{
    public static SalesReport Build(Customer[] customers, Order[] orders)
    {
        // GroupJoin keeps every customer, with the (possibly empty) sequence of their orders.
        var customerOrders = customers
            .GroupJoin(orders, customer => customer.Id, order => order.CustomerId,
                (customer, theirOrders) => new { Customer = customer, Orders = theirOrders.ToList() })
            .ToList();

        var regions = customerOrders
            .GroupBy(entry => entry.Customer.Region)
            .Select(group =>
            {
                var regionOrders = group.SelectMany(entry => entry.Orders).ToList();
                var lines = regionOrders.SelectMany(order => order.Lines).ToList();
                return new RegionRevenue(
                    group.Key,
                    group.Count(),
                    group.Count(entry => entry.Orders.Count == 0),
                    regionOrders.Count,
                    lines.Sum(line => line.Quantity),
                    lines.Sum(line => line.Quantity * line.UnitPrice));
            })
            .OrderByDescending(region => region.Revenue)
            .ThenBy(region => region.Region, StringComparer.Ordinal)
            .ToList();

        // An inner Join drops orders with no matching customer.
        var knownOrders = orders.Join(customers, order => order.CustomerId, customer => customer.Id, (order, customer) => order);

        var topSkus = knownOrders
            .SelectMany(order => order.Lines)
            .GroupBy(line => line.Sku)
            .Select(group => new SkuUnits(group.Key, group.Sum(line => line.Quantity)))
            .OrderByDescending(sku => sku.Units)
            .ThenBy(sku => sku.Sku, StringComparer.Ordinal)
            .Take(3)
            .ToList();

        var customerIds = customers.Select(customer => customer.Id).ToHashSet();
        var orphans = orders
            .Where(order => !customerIds.Contains(order.CustomerId))
            .Select(order => order.Id)
            .OrderBy(id => id, StringComparer.Ordinal)
            .ToList();

        return new SalesReport(regions, topSkus, orphans);
    }
}
