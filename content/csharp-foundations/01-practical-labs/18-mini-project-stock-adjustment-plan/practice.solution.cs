public sealed record AdjustmentResult(bool Accepted, int Stock, string Reason);
public static class Exercise
{
    public static AdjustmentResult Adjust(int stock, int delta)
    {
        var next = (long)stock + delta; if (next < 0 || next > int.MaxValue) return new AdjustmentResult(false, stock, "out-of-range"); return new AdjustmentResult(true, (int)next, "ok");
    }
}
