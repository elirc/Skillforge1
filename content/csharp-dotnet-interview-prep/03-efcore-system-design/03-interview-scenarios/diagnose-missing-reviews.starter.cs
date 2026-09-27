public sealed record Completion(string UserId, string LessonId);
public sealed record KnowledgeItem(string Id, string LessonId);
public sealed record ReviewState(string UserId, string KnowledgeItemId, DateTime DueAt);

public static class MissingReviewsTriage
{
    // Bug report: "I completed a lesson but no reviews appear." Walk the layers in
    // order and return the FIRST check that fails:
    //   1. No Completion for (userId, lessonId)                 -> "missing-completion"
    //   2. The lesson has no KnowledgeItems                     -> "lesson-has-no-items"
    //   3. The user has no ReviewState for any of those items:
    //        - but another user does                           -> "seeded-for-wrong-user"
    //        - and nobody does                                 -> "missing-review-states"
    //   4. The user has states for only some of the items      -> "partially-seeded"
    //   5. None of the user's states is due (DueAt <= now)     -> "none-due-yet"
    //   6. Everything checks out                               -> "ok"
    public static string Diagnose(
        string userId,
        string lessonId,
        DateTime now,
        Completion[] completions,
        KnowledgeItem[] items,
        ReviewState[] states)
    {
        return "ok";
    }
}
