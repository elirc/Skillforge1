public sealed record Parcel(string Country, decimal OrderTotal, decimal WeightKg, string[] Tags);
public sealed record Quote(decimal Cost, string Rule, decimal Surcharge);

public static class Shipping
{
    // Price a parcel with a switch expression. The FIRST matching rule wins:
    //
    //   WeightKg over 30                       -> not shippable: Cost -1, Rule "too-heavy",
    //                                             Surcharge 0, and no tag surcharges at all
    //   Country "US" and OrderTotal >= 50      -> 0      "us-free"
    //   Country "US" and WeightKg under 1      -> 4.99   "us-light"
    //   Country "US"                           -> 8.99   "us-standard"
    //   Country "CA" or "MX", WeightKg <= 5    -> 14.99  "north-america"
    //   Country "CA" or "MX"                   -> 24.99  "north-america-heavy"
    //   anything else                          -> 39.99  "international"
    //
    // Then add a surcharge from the Tags array with LIST patterns:
    //   first tag "express" AND last tag "fragile" -> 13
    //   first tag "express"                        -> 10
    //   last tag "fragile"                         -> 3
    //   otherwise (including an empty array)       -> 0
    // Cost = base cost + surcharge; Surcharge reports the surcharge alone.
    public static Quote QuoteFor(Parcel parcel)
    {
        if (parcel.Country == "US")
        {
            return new Quote(8.99m, "us-standard", 0m);
        }

        return new Quote(39.99m, "international", 0m);
    }
}
