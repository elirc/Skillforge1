public sealed record Row(int Id, int Version, string Title, int Quantity);
public sealed record Update(int Id, int ExpectedVersion, string? Title, int? Quantity);
public sealed record MergeResult(List<string> Outcomes, List<Row> Rows);

public static class ConcurrencyMerge
{
    // Track, per row and per field, the version at which that field last changed.
    // An update conflicts only when a field it touches changed after ExpectedVersion.
    public static MergeResult ApplyUpdates(List<Row> rows, List<Update> updates)
    {
        throw new NotImplementedException();
    }
}
