public sealed record Line(decimal UnitPrice, int Quantity);
public sealed record Invoice(decimal Subtotal, decimal Tax, decimal Total);
public static class Exercise
{
    public static Invoice BuildInvoice(Line[] lines)
    {
        return new Invoice(0m, 0m, 0m);
    }
}
