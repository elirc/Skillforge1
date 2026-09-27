using System.Text.RegularExpressions;

public sealed record LogEvent(string Message, Dictionary<string, string> Properties);

public static class StructuredLog
{
    private static readonly string[] SensitiveFragments = { "password", "token", "secret", "authorization", "apikey" };

    public static LogEvent BuildLogEvent(string template, string[] args)
    {
        var properties = new Dictionary<string, string>();
        var nextArg = 0;

        // Placeholders bind to arguments by POSITION, not by name.
        var message = Regex.Replace(template, @"\{@?([A-Za-z_][A-Za-z0-9_]*)\}", match =>
        {
            var index = nextArg++;
            if (index >= args.Length)
            {
                return match.Value;
            }

            var name = match.Groups[1].Value;
            var value = IsSensitive(name) ? "***" : args[index];
            properties[name] = value;
            return value;
        });

        return new LogEvent(message, properties);
    }

    private static bool IsSensitive(string name) =>
        SensitiveFragments.Any(fragment => name.Contains(fragment, StringComparison.OrdinalIgnoreCase));
}
