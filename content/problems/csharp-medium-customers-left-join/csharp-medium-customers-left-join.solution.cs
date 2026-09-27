public sealed record Customer(int Id, string Name);
public sealed record CustomerOrder(int Id, int CustomerId, decimal Total, DateTime PlacedAt);
public sealed record CustomerSummary(int CustomerId, string Name, int OrderCount, decimal LifetimeValue, string LastOrderDate);

public static class CustomerReport
{
    public static List<CustomerSummary> Summarize(List<Customer> customers, List<CustomerOrder> orders)
    {
        return customers
            .GroupJoin(
                orders,
                customer => customer.Id,
                order => order.CustomerId,
                (customer, theirOrders) =>
                {
                    var list = theirOrders.ToList();
                    var last = list.Count == 0
                        ? "never"
                        : list.Max(order => order.PlacedAt).ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
                    return new CustomerSummary(customer.Id, customer.Name, list.Count, list.Sum(order => order.Total), last);
                })
            .OrderByDescending(summary => summary.LifetimeValue)
            .ThenBy(summary => summary.Name, StringComparer.Ordinal)
            .ThenBy(summary => summary.CustomerId)
            .ToList();
    }
}
