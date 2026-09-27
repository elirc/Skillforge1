public sealed record StockEvent(string EventId, string Sku, string Warehouse, int Delta);
public sealed record StockSnapshot(List<string> Levels, List<string> DuplicateEventIds, List<string> Locations);

public static class StockLedger
{
    public static StockSnapshot Replay(StockEvent[] events)
    {
        // HashSet: O(1) "have I seen this?" checks.
        var seen = new HashSet<string>(StringComparer.Ordinal);
        var duplicates = new List<string>();
        var accepted = new List<StockEvent>();
        foreach (var stockEvent in events)
        {
            if (seen.Add(stockEvent.EventId))
            {
                accepted.Add(stockEvent);
            }
            else
            {
                duplicates.Add(stockEvent.EventId);
            }
        }

        // Dictionary with a comparer: the comparer decides what "same key" means,
        // and the first key inserted keeps its casing.
        var levels = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var stockEvent in accepted)
        {
            levels[stockEvent.Sku] = levels.TryGetValue(stockEvent.Sku, out var current)
                ? current + stockEvent.Delta
                : stockEvent.Delta;
        }

        // Lookup: an immutable one-to-many index; a missing key yields an empty sequence.
        var warehousesBySku = accepted.ToLookup(stockEvent => stockEvent.Sku, stockEvent => stockEvent.Warehouse, StringComparer.OrdinalIgnoreCase);

        var skus = levels.Keys.OrderBy(sku => sku, StringComparer.OrdinalIgnoreCase).ToList();

        return new StockSnapshot(
            skus.Select(sku => $"{sku}={levels[sku]}").ToList(),
            duplicates,
            skus.Select(sku => $"{sku}: {string.Join(", ", warehousesBySku[sku].Distinct().OrderBy(w => w, StringComparer.Ordinal))}").ToList());
    }
}
