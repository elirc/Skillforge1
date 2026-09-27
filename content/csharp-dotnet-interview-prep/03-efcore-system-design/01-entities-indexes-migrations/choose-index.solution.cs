public sealed record IndexDef(string Name, string[] Columns);
public sealed record QueryShape(string[] EqualityColumns, string? RangeColumn, string? OrderByColumn);

public static class IndexAdvisor
{
    public static string ChooseIndex(IndexDef[] indexes, QueryShape query)
    {
        var best = "full-scan";
        var bestMatched = 0;
        var bestSorted = false;
        var bestWidth = int.MaxValue;

        foreach (var index in indexes)
        {
            var (matched, sorted) = Score(index, query);
            if (matched == 0) continue;

            var better =
                matched > bestMatched ||
                (matched == bestMatched && sorted && !bestSorted) ||
                (matched == bestMatched && sorted == bestSorted && index.Columns.Length < bestWidth);

            if (better)
            {
                best = index.Name;
                bestMatched = matched;
                bestSorted = sorted;
                bestWidth = index.Columns.Length;
            }
        }

        return best;
    }

    private static (int Matched, bool Sorted) Score(IndexDef index, QueryShape query)
    {
        var columns = index.Columns;

        // Leftmost prefix: equality columns can be consumed in any order, but only
        // while they are contiguous from the first index column.
        var position = 0;
        while (position < columns.Length && query.EqualityColumns.Contains(columns[position]))
        {
            position++;
        }

        var matched = position;
        var next = position < columns.Length ? columns[position] : null;

        // One range predicate can use the column right after the equality prefix.
        if (query.RangeColumn is not null && next == query.RangeColumn)
        {
            matched++;
        }

        // After seeking on the equality prefix, rows come out ordered by the next column.
        var sorted = query.OrderByColumn is null || next == query.OrderByColumn;
        return (matched, sorted);
    }
}
