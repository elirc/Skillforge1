public static class Profiles
{
    // Return the GitHub handle when it carries real text, otherwise the display
    // name. A handle that is null, empty, or only whitespace is not real text.
    // Trim the handle before returning it.
    public static string HandleOrFallback(string? gitHubUserName, string displayName)
    {
        throw new NotImplementedException();
    }
}
