
public static class Exercise
{
    public static string LastOrDefault(string[] values)
    {
        return values.Length == 0 ? "none" : values[values.Length - 1];
    }
}
