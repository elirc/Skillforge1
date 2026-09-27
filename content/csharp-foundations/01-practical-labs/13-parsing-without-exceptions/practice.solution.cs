
public static class Exercise
{
    public static int ParseQuantity(string text)
    {
        return int.TryParse(text, out var quantity) && quantity > 0 ? quantity : 0;
    }
}
