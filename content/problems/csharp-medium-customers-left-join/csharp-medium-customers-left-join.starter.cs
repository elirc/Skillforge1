public sealed record Customer(int Id, string Name);
public sealed record CustomerOrder(int Id, int CustomerId, decimal Total, DateTime PlacedAt);
public sealed record CustomerSummary(int CustomerId, string Name, int OrderCount, decimal LifetimeValue, string LastOrderDate);

public static class CustomerReport
{
    // Left join customers to orders (GroupJoin), aggregate, and sort by
    // LifetimeValue desc, Name, CustomerId.
    public static List<CustomerSummary> Summarize(List<Customer> customers, List<CustomerOrder> orders)
    {
        throw new NotImplementedException();
    }
}
