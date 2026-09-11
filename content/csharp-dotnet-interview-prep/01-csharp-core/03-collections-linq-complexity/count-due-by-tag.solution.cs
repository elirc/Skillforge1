public sealed record ReviewState(string ConceptTag, DateTime DueAt);

public static class ReviewStats
{
    public static Dictionary<string, int> CountDueByTag(IReadOnlyList<ReviewState> states, DateTime now)
    {
        return states
            .Where(state => state.DueAt <= now)
            .GroupBy(state => state.ConceptTag)
            .ToDictionary(group => group.Key, group => group.Count());
    }
}
