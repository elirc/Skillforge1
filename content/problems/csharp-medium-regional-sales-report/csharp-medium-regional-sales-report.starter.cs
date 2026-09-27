public sealed record SaleOrder(int Id, string Region, DateTime PlacedAt, decimal Total, string Status);
public sealed record RegionMonthTotal(string Month, string Region, int OrderCount, decimal Revenue);

public static class SalesReport
{
    // Skip cancelled orders, group by (yyyy-MM, Region), and order by
    // Month asc, Revenue desc, Region.
    public static List<RegionMonthTotal> MonthlyByRegion(List<SaleOrder> orders)
    {
        throw new NotImplementedException();
    }
}
