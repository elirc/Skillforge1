public sealed record Movement(string Sku, int Delta);
public static class Exercise
{
    public static Dictionary<string, int> Totals(Movement[] rows)
    {
        return new Dictionary<string, int>();
    }
}
