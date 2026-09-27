public sealed record ProductStock(string Sku, int Stock);
public static class Exercise
{
    public static string[] AvailableSkus(ProductStock[] products)
    {
        return Array.Empty<string>();
    }
}
