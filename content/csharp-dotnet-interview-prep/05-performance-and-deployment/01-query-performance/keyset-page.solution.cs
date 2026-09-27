public sealed record DueReview(string Id, string UserId, DateTime DueAt);
public sealed record Cursor(DateTime DueAt, string Id);
public sealed record Page(List<string> Ids, Cursor? Next);

public static class DueQueue
{
    public static Page NextPage(DueReview[] rows, string userId, DateTime now, Cursor? after, int pageSize)
    {
        var size = Math.Clamp(pageSize, 1, 50);

        var query = rows.Where(row => row.UserId == userId && row.DueAt <= now);

        if (after is not null)
        {
            // Seek past the last row the client saw. The Id tie-breaker keeps rows
            // that share a DueAt from being skipped or repeated.
            query = query.Where(row =>
                row.DueAt > after.DueAt ||
                (row.DueAt == after.DueAt && string.CompareOrdinal(row.Id, after.Id) > 0));
        }

        // Fetch one extra row to learn whether another page exists.
        var slice = query
            .OrderBy(row => row.DueAt)
            .ThenBy(row => row.Id, StringComparer.Ordinal)
            .Take(size + 1)
            .ToList();

        var page = slice.Take(size).ToList();
        var next = slice.Count > size ? new Cursor(page[^1].DueAt, page[^1].Id) : null;

        return new Page(page.Select(row => row.Id).ToList(), next);
    }
}
