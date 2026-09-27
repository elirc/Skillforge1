
public static class Exercise
{
    public static string DisplayName(string? name)
    {
        return string.IsNullOrWhiteSpace(name) ? "Guest" : name.Trim();
    }
}
