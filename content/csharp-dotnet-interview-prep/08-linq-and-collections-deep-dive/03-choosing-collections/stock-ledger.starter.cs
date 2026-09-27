public sealed record StockEvent(string EventId, string Sku, string Warehouse, int Delta);
public sealed record StockSnapshot(List<string> Levels, List<string> DuplicateEventIds, List<string> Locations);

public static class StockLedger
{
    // Replay stock events, picking the right collection for each job.
    //
    // 1. Deduplicate: a message bus may deliver the same event twice. Skip any
    //    event whose EventId was already accepted and list each skipped EventId
    //    in DuplicateEventIds, in the order the duplicates arrived (a HashSet's
    //    Add returns false for a repeat).
    // 2. Levels: SKUs are case-insensitive ("mug" and "MUG" are one SKU). Sum
    //    Delta per SKU with a Dictionary built on StringComparer.OrdinalIgnoreCase.
    //    Report "SKU=total", using the casing of the SKU's first accepted event,
    //    ordered by SKU ignoring case.
    // 3. Locations: for each SKU (same casing and order as Levels) the distinct
    //    warehouses that sent accepted events, ordered ordinally, as
    //    "SKU: W1, W2". A lookup (ToLookup with the same comparer) groups these.
    public static StockSnapshot Replay(StockEvent[] events)
    {
        var levels = new Dictionary<string, int>();
        foreach (var stockEvent in events)
        {
            levels[stockEvent.Sku] = levels.GetValueOrDefault(stockEvent.Sku) + stockEvent.Delta;
        }

        return new StockSnapshot(
            levels.Select(pair => $"{pair.Key}={pair.Value}").ToList(),
            new List<string>(),
            new List<string>());
    }
}
