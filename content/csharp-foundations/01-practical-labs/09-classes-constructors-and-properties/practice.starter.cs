public sealed class Product { public string Sku { get; } public int Stock { get; } public Product(string sku, int stock) { Sku = sku; Stock = stock; } }
public static class Exercise
{
    public static string Describe(string sku, int stock)
    {
        return string.Empty;
    }
}
