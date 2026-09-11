public sealed record ReviewState(string ConceptTag, DateTime DueAt);

public static class ReviewStats
{
    // Count how many review cards are due, grouped by concept tag.
    // A card is due when its DueAt is at or before `now`.
    // Tags with nothing due must not appear in the result.
    public static Dictionary<string, int> CountDueByTag(IReadOnlyList<ReviewState> states, DateTime now)
    {
        throw new NotImplementedException();
    }
}
