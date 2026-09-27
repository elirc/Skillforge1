public sealed record Line(decimal UnitPrice, int Quantity);
public sealed record Invoice(decimal Subtotal, decimal Tax, decimal Total);
public static class Exercise
{
    public static Invoice BuildInvoice(Line[] lines)
    {
        var subtotal = lines.Sum(line => line.UnitPrice * line.Quantity); var tax = Math.Round(subtotal * 0.10m, 2, MidpointRounding.AwayFromZero); return new Invoice(subtotal, tax, subtotal + tax);
    }
}
