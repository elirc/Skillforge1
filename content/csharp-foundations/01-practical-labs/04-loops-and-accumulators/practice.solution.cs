
public static class Exercise
{
    public static int SumPositive(int[] values)
    {
        var total = 0; foreach (var value in values) { if (value > 0) total += value; } return total;
    }
}
