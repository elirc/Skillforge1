
public static class Exercise
{
    public static int CountSku(string[] skus, string target)
    {
        var counts = new Dictionary<string, int>(); foreach (var sku in skus) counts[sku] = counts.GetValueOrDefault(sku) + 1; return counts.GetValueOrDefault(target);
    }
}
