public sealed record DueReview(string Id, string UserId, DateTime DueAt);
public sealed record Cursor(DateTime DueAt, string Id);
public sealed record Page(List<string> Ids, Cursor? Next);

public static class DueQueue
{
    // Return one page of a learner's due reviews using KEYSET (seek) pagination,
    // the in-memory version of:
    //
    //   WHERE UserId = @userId AND DueAt <= @now
    //     AND (DueAt > @afterDueAt OR (DueAt = @afterDueAt AND Id > @afterId))
    //   ORDER BY DueAt, Id
    //   LIMIT @pageSize + 1
    //
    // Rules:
    //   - Only rows for userId with DueAt <= now.
    //   - Order by DueAt, then Id (ordinal string comparison) as a tie-breaker.
    //   - `after` is null for the first page; otherwise return only rows that come
    //     strictly after it in that order.
    //   - Clamp pageSize to 1..50.
    //   - Next is the cursor (DueAt and Id) of the last row on this page when more
    //     rows remain after it, otherwise null.
    public static Page NextPage(DueReview[] rows, string userId, DateTime now, Cursor? after, int pageSize)
    {
        return new Page(new List<string>(), null);
    }
}
