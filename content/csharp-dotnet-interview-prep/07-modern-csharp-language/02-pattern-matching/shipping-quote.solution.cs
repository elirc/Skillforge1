public sealed record Parcel(string Country, decimal OrderTotal, decimal WeightKg, string[] Tags);
public sealed record Quote(decimal Cost, string Rule, decimal Surcharge);

public static class Shipping
{
    public static Quote QuoteFor(Parcel parcel)
    {
        // Property + relational patterns; arms are tried top to bottom.
        var (cost, rule) = parcel switch
        {
            { WeightKg: > 30m } => (-1m, "too-heavy"),
            { Country: "US", OrderTotal: >= 50m } => (0m, "us-free"),
            { Country: "US", WeightKg: < 1m } => (4.99m, "us-light"),
            { Country: "US" } => (8.99m, "us-standard"),
            { Country: "CA" or "MX", WeightKg: <= 5m } => (14.99m, "north-america"),
            { Country: "CA" or "MX" } => (24.99m, "north-america-heavy"),
            _ => (39.99m, "international"),
        };

        if (cost < 0m)
        {
            return new Quote(cost, rule, 0m);
        }

        // List patterns: `..` matches any number of elements, including none.
        var surcharge = parcel.Tags switch
        {
            ["express", .., "fragile"] => 13m,
            ["express", ..] => 10m,
            [.., "fragile"] => 3m,
            _ => 0m,
        };

        return new Quote(cost + surcharge, rule, surcharge);
    }
}
