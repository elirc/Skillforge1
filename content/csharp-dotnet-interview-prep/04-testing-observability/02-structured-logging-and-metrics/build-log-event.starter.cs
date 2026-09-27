using System.Text.RegularExpressions;

public sealed record LogEvent(string Message, Dictionary<string, string> Properties);

public static class StructuredLog
{
    // Render a message template the way ILogger does, and capture its properties.
    //
    //   BuildLogEvent("Completed {LessonId} for {UserId}", ["l-1", "u-7"])
    //     -> Message    "Completed l-1 for u-7"
    //        Properties { LessonId: "l-1", UserId: "u-7" }
    //
    // Rules:
    //   - A placeholder is {Name}, or {@Name} (the @ asks for destructuring; the
    //     property is still called Name). Names are letters, digits and underscores.
    //   - Placeholders bind to args by POSITION, left to right, not by name.
    //   - A placeholder with no matching arg stays in the message as written and
    //     adds no property. Extra args are ignored.
    //   - Redaction: if the property name contains "password", "token", "secret",
    //     "authorization" or "apikey" (any casing), use "***" in BOTH the message
    //     and the property value.
    // Hint: Regex.Replace with a MatchEvaluator visits matches left to right.
    public static LogEvent BuildLogEvent(string template, string[] args)
    {
        return new LogEvent(template, new Dictionary<string, string>());
    }
}
