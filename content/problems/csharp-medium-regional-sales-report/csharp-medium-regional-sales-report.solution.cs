public sealed record SaleOrder(int Id, string Region, DateTime PlacedAt, decimal Total, string Status);
public sealed record RegionMonthTotal(string Month, string Region, int OrderCount, decimal Revenue);

public static class SalesReport
{
    public static List<RegionMonthTotal> MonthlyByRegion(List<SaleOrder> orders)
    {
        return orders
            .Where(order => order.Status != "Cancelled")
            .GroupBy(order => new { Month = $"{order.PlacedAt.Year:D4}-{order.PlacedAt.Month:D2}", order.Region })
            .Select(group => new RegionMonthTotal(
                group.Key.Month,
                group.Key.Region,
                group.Count(),
                group.Sum(order => order.Total)))
            .OrderBy(row => row.Month, StringComparer.Ordinal)
            .ThenByDescending(row => row.Revenue)
            .ThenBy(row => row.Region, StringComparer.Ordinal)
            .ToList();
    }
}
