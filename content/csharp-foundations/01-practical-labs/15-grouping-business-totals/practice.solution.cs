public sealed record Movement(string Sku, int Delta);
public static class Exercise
{
    public static Dictionary<string, int> Totals(Movement[] rows)
    {
        return rows.GroupBy(row => row.Sku).ToDictionary(group => group.Key, group => group.Sum(row => row.Delta));
    }
}
