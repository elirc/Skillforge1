public sealed record ProductStock(string Sku, int Stock);
public static class Exercise
{
    public static string[] AvailableSkus(ProductStock[] products)
    {
        return products.Where(p => p.Stock > 0).OrderBy(p => p.Sku, StringComparer.Ordinal).Select(p => p.Sku).ToArray();
    }
}
