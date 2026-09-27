public sealed record Row(int Id, string Status, decimal Total);

// One LINQ operator in a query chain. Kind is one of:
//   "whereStatus"    - Status == step.Status           (translatable to SQL)
//   "whereMinTotal"  - Total >= step.Min                (translatable to SQL)
//   "orderByTotal"   - Total descending, then Id        (translatable to SQL)
//   "take"           - the first step.Count rows        (translatable to SQL)
//   "whereLocal"     - Total >= step.Min, but written as a call to a C# helper
//                      method, which the SQL provider CANNOT translate
//   "asEnumerable"   - AsEnumerable(): everything after it runs in memory
public sealed record Step(string Kind, string? Status, decimal? Min, int? Count);

public sealed record QueryPlan(List<string> ServerSteps, List<string> ClientSteps, int RowsFetched, List<int> Ids, string? Error);

public static class QueryPlanner
{
    // Model how an IQueryable chain against a database runs.
    //
    // - Steps before the first "asEnumerable" run on the SERVER (as SQL); steps
    //   after it run on the CLIENT (LINQ to Objects). List each step's Kind in
    //   ServerSteps or ClientSteps. "asEnumerable" itself is listed in neither,
    //   and a second one changes nothing.
    // - RowsFetched is how many rows cross the wire: the rows left after the
    //   server steps (the whole table when there are none).
    // - Ids are the final rows' Ids after the client steps too.
    // - A "whereLocal" step on the server cannot be translated. Like EF Core,
    //   fail the whole query instead of silently running it: return empty lists,
    //   RowsFetched 0 and Error "whereLocal could not be translated". Otherwise
    //   Error is null.
    // Without an order step, rows keep table order.
    public static QueryPlan Plan(Row[] table, Step[] steps)
    {
        // This treats every step as in-memory and reads the whole table.
        IEnumerable<Row> rows = table;
        foreach (var step in steps)
        {
            rows = Apply(rows, step);
        }

        return new QueryPlan(
            new List<string>(),
            steps.Where(step => step.Kind != "asEnumerable").Select(step => step.Kind).ToList(),
            table.Length,
            rows.Select(row => row.Id).ToList(),
            null);
    }

    private static IEnumerable<Row> Apply(IEnumerable<Row> rows, Step step) => step.Kind switch
    {
        "whereStatus" => rows.Where(row => row.Status == step.Status),
        "whereMinTotal" or "whereLocal" => rows.Where(row => row.Total >= step.Min),
        "orderByTotal" => rows.OrderByDescending(row => row.Total).ThenBy(row => row.Id),
        "take" => rows.Take(step.Count ?? 0),
        _ => rows,
    };
}
