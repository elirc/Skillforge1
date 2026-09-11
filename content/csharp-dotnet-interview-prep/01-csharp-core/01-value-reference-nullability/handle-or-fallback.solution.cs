public static class Profiles
{
    public static string HandleOrFallback(string? gitHubUserName, string displayName)
    {
        return string.IsNullOrWhiteSpace(gitHubUserName) ? displayName : gitHubUserName.Trim();
    }
}
