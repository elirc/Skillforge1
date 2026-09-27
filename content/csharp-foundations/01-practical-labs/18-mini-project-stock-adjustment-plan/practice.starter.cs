public sealed record AdjustmentResult(bool Accepted, int Stock, string Reason);
public static class Exercise
{
    public static AdjustmentResult Adjust(int stock, int delta)
    {
        return new AdjustmentResult(false, stock, "out-of-range");
    }
}
