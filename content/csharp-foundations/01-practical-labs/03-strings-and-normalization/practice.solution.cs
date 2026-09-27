
public static class Exercise
{
    public static string NormalizeSku(string raw)
    {
        return raw.Trim().ToUpperInvariant();
    }
}
