public sealed record Row(int Id, string Status, decimal Total);

public sealed record Step(string Kind, string? Status, decimal? Min, int? Count);

public sealed record QueryPlan(List<string> ServerSteps, List<string> ClientSteps, int RowsFetched, List<int> Ids, string? Error);

public static class QueryPlanner
{
    public static QueryPlan Plan(Row[] table, Step[] steps)
    {
        var server = new List<Step>();
        var client = new List<Step>();
        var onServer = true;

        foreach (var step in steps)
        {
            if (step.Kind == "asEnumerable")
            {
                onServer = false;
                continue;
            }

            if (onServer && step.Kind == "whereLocal")
            {
                // EF Core throws rather than quietly pulling the table into memory.
                return new QueryPlan(new List<string>(), new List<string>(), 0, new List<int>(), "whereLocal could not be translated");
            }

            (onServer ? server : client).Add(step);
        }

        // The database does this part...
        IEnumerable<Row> rows = table;
        foreach (var step in server)
        {
            rows = Apply(rows, step);
        }

        var fetched = rows.ToList();

        // ...and only these rows cross the wire for the in-memory part.
        IEnumerable<Row> result = fetched;
        foreach (var step in client)
        {
            result = Apply(result, step);
        }

        return new QueryPlan(
            server.Select(step => step.Kind).ToList(),
            client.Select(step => step.Kind).ToList(),
            fetched.Count,
            result.Select(row => row.Id).ToList(),
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
