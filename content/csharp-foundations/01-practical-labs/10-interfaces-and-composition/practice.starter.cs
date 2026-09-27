public interface IShipping { decimal Fee(); }
public sealed class StandardShipping : IShipping { public decimal Fee() => 5m; }
public sealed class ExpressShipping : IShipping { public decimal Fee() => 12m; }
public static class Exercise
{
    public static decimal Quote(decimal subtotal, bool expedited)
    {
        return subtotal;
    }
}
