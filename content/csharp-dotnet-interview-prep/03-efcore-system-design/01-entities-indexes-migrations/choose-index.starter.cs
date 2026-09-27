public sealed record IndexDef(string Name, string[] Columns);
public sealed record QueryShape(string[] EqualityColumns, string? RangeColumn, string? OrderByColumn);

public static class IndexAdvisor
{
    // Pick the index a B-tree query planner would use for this query shape,
    // or "full-scan" when no index helps.
    //
    // Score each index by its LEFTMOST PREFIX:
    //   1. Walk the index columns from the first one. While the column is one of
    //      query.EqualityColumns (in any order), it matches: +1.
    //   2. If the column right after that prefix is query.RangeColumn, it matches
    //      too: +1. (Only one range column can use an index.)
    //   3. The index "sorts" the result when query.OrderByColumn is null, or when
    //      the column right after the equality prefix is query.OrderByColumn.
    // An index with 0 matched columns is useless.
    //
    // Choose the most matched columns; break ties by preferring an index that
    // sorts, then the index with fewer columns, then the one declared first.
    public static string ChooseIndex(IndexDef[] indexes, QueryShape query)
    {
        return "full-scan";
    }
}
