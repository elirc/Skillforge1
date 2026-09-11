using System.Text.Json;

namespace Skillforge.CsharpRunner;

/// <summary>
/// Structural comparison of a learner's return value against the authored
/// `expected` JSON. Mirrors the JavaScript harness, which compares with
/// `JSON.stringify`, but without depending on property order and treating
/// `8` and `8.0` as equal so an author can write either.
/// </summary>
public static class JsonCompare
{
    public static bool DeepEquals(JsonElement a, JsonElement b)
    {
        if (a.ValueKind != b.ValueKind)
        {
            // Roslyn returns numbers as whatever the method's return type is, so
            // an authored `8` must still match a `double` 8.0.
            if (IsNumber(a) && IsNumber(b)) return NumbersEqual(a, b);
            return false;
        }

        switch (a.ValueKind)
        {
            case JsonValueKind.Object:
                var aProps = a.EnumerateObject().ToDictionary(p => p.Name, p => p.Value);
                var bProps = b.EnumerateObject().ToDictionary(p => p.Name, p => p.Value);
                if (aProps.Count != bProps.Count) return false;
                foreach (var (name, value) in aProps)
                {
                    if (!bProps.TryGetValue(name, out var other)) return false;
                    if (!DeepEquals(value, other)) return false;
                }
                return true;

            case JsonValueKind.Array:
                var aItems = a.EnumerateArray().ToList();
                var bItems = b.EnumerateArray().ToList();
                if (aItems.Count != bItems.Count) return false;
                for (var i = 0; i < aItems.Count; i++)
                {
                    if (!DeepEquals(aItems[i], bItems[i])) return false;
                }
                return true;

            case JsonValueKind.Number:
                return NumbersEqual(a, b);

            case JsonValueKind.String:
                return a.GetString() == b.GetString();

            default:
                // true / false / null carry no payload; matching kinds is equality.
                return true;
        }
    }

    private static bool IsNumber(JsonElement element) => element.ValueKind == JsonValueKind.Number;

    private static bool NumbersEqual(JsonElement a, JsonElement b)
    {
        if (a.TryGetInt64(out var aLong) && b.TryGetInt64(out var bLong)) return aLong == bLong;
        if (!a.TryGetDouble(out var aDouble) || !b.TryGetDouble(out var bDouble)) return false;
        if (double.IsNaN(aDouble) && double.IsNaN(bDouble)) return true;
        // Floating point results should not fail on representation noise.
        return Math.Abs(aDouble - bDouble) <= 1e-9 * Math.Max(1, Math.Max(Math.Abs(aDouble), Math.Abs(bDouble)));
    }
}
