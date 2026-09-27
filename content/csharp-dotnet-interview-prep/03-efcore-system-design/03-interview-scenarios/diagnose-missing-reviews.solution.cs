public sealed record Completion(string UserId, string LessonId);
public sealed record KnowledgeItem(string Id, string LessonId);
public sealed record ReviewState(string UserId, string KnowledgeItemId, DateTime DueAt);

public static class MissingReviewsTriage
{
    public static string Diagnose(
        string userId,
        string lessonId,
        DateTime now,
        Completion[] completions,
        KnowledgeItem[] items,
        ReviewState[] states)
    {
        // 1. Did the completion write happen at all?
        if (!completions.Any(c => c.UserId == userId && c.LessonId == lessonId))
        {
            return "missing-completion";
        }

        // 2. Is there anything to review for this lesson?
        var itemIds = items.Where(item => item.LessonId == lessonId).Select(item => item.Id).ToHashSet();
        if (itemIds.Count == 0)
        {
            return "lesson-has-no-items";
        }

        // 3. Were review rows written, and for the right user?
        var lessonStates = states.Where(state => itemIds.Contains(state.KnowledgeItemId)).ToList();
        var mine = lessonStates.Where(state => state.UserId == userId).ToList();
        if (mine.Count == 0)
        {
            return lessonStates.Count > 0 ? "seeded-for-wrong-user" : "missing-review-states";
        }

        if (mine.Select(state => state.KnowledgeItemId).Distinct().Count() < itemIds.Count)
        {
            return "partially-seeded";
        }

        // 4. Does the due filter exclude everything?
        if (!mine.Any(state => state.DueAt <= now))
        {
            return "none-due-yet";
        }

        return "ok";
    }
}
