
public static class Exercise
{
    public static string ReadQuantity(string text)
    {
        try { return $"ok:{int.Parse(text, System.Globalization.CultureInfo.InvariantCulture)}"; } catch (FormatException) { return "invalid-format"; } catch (OverflowException) { return "out-of-range"; }
    }
}
