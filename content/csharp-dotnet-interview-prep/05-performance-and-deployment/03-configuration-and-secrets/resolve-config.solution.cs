public sealed record ConfigLayer(string Source, Dictionary<string, string?> Values);
public sealed record ResolvedConfig(Dictionary<string, string> Values, List<string> Errors);

public static class LayeredConfig
{
    private static readonly string[] SecretFragments = { "password", "apikey", "secret", "connectionstrings" };

    public static ResolvedConfig Resolve(ConfigLayer[] layers, string[] requiredKeys)
    {
        // Configuration keys are case-insensitive. Updating an existing key keeps
        // the casing it was first added with.
        var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var secretWarnings = new List<string>();

        foreach (var layer in layers)
        {
            var committed = layer.Source.StartsWith("appsettings", StringComparison.OrdinalIgnoreCase);

            foreach (var (rawKey, value) in layer.Values)
            {
                if (value is null) continue;

                // Environment variables cannot contain ':' so they use "__" instead.
                var key = rawKey.Replace("__", ":");

                if (committed && value.Length > 0 && LooksSecret(key))
                {
                    secretWarnings.Add($"Secret in committed file: {key} ({layer.Source})");
                }

                // Later layers win.
                values[key] = value;
            }
        }

        var errors = requiredKeys
            .Where(required => !values.TryGetValue(required, out var found) || string.IsNullOrWhiteSpace(found))
            .Select(required => $"Missing: {required}")
            .Concat(secretWarnings)
            .ToList();

        return new ResolvedConfig(values, errors);
    }

    private static bool LooksSecret(string key) =>
        SecretFragments.Any(fragment => key.Contains(fragment, StringComparison.OrdinalIgnoreCase));
}
