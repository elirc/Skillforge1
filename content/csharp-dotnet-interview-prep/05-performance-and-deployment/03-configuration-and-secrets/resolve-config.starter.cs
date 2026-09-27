public sealed record ConfigLayer(string Source, Dictionary<string, string?> Values);
public sealed record ResolvedConfig(Dictionary<string, string> Values, List<string> Errors);

public static class LayeredConfig
{
    // Merge configuration layers the way ConfigurationBuilder does, then validate
    // at "startup". Layers arrive lowest precedence first, for example:
    //   appsettings.json, appsettings.Production.json, user-secrets, environment
    //
    // Merging:
    //   - Later layers override earlier ones.
    //   - Keys are case-insensitive: "EMAIL:HOST" overrides "Email:Host", and the
    //     result keeps the casing the key was FIRST added with.
    //   - "__" in a key means ":" (environment variables cannot contain ':').
    //   - A null value is skipped (it does not override anything).
    //
    // Errors, in this order:
    //   1. "Missing: {key}" for each requiredKeys entry (as written there) that is
    //      absent or blank after merging, in requiredKeys order.
    //   2. "Secret in committed file: {key} ({Source})" for every non-empty value
    //      whose key contains "password", "apikey", "secret" or "connectionstrings"
    //      (any casing) and whose layer Source starts with "appsettings" - those
    //      files are committed to source control. Report the key with "__"
    //      already turned into ":", in layer order then key order.
    public static ResolvedConfig Resolve(ConfigLayer[] layers, string[] requiredKeys)
    {
        return new ResolvedConfig(new Dictionary<string, string>(), new List<string>());
    }
}
