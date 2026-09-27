public sealed record Product(string Sku, decimal Price);
public static class Exercise
{
    public static bool SameProduct(Product left, Product right)
    {
        return false;
    }
}
