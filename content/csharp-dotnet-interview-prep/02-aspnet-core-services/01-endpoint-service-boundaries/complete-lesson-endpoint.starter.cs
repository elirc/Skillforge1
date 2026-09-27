public sealed record Lesson(string Id, string[] ConceptTags);
public sealed record CompletionResponse(int Status, string Code, string[] SeededConcepts);
public sealed record ServiceOutcome(string Kind, string[] SeededConcepts);

public static class CompleteLessonEndpoint
{
    // The ENDPOINT owns transport concerns, checked in this order:
    //   1. No signed-in user (claimUserId null or blank) -> 401 "unauthenticated".
    //      Never trust a user id from the request body; it comes from claims.
    //   2. Blank lessonId route value                     -> 400 "invalid-lesson-id".
    //   3. Otherwise call LessonCompletionService.Complete and map its outcome:
    //        "not-found"         -> 404 "lesson-not-found"
    //        "already-completed" -> 200 "already-completed" (completion is idempotent)
    //        "completed"         -> 200 "completed" with the seeded concepts
    // Every response other than "completed" has an empty SeededConcepts array.
    public static CompletionResponse Handle(string? claimUserId, string lessonId, Lesson[] lessons, string[] completedLessonIds)
    {
        return new CompletionResponse(200, "completed", Array.Empty<string>());
    }
}

public static class LessonCompletionService
{
    // The SERVICE owns the use case and its invariant:
    //   - unknown lesson id                        -> Kind "not-found"
    //   - lesson id already in completedLessonIds  -> Kind "already-completed" (seed nothing again)
    //   - otherwise                                -> Kind "completed", seeding the lesson's
    //     concept tags once each, sorted with ordinal comparison.
    public static ServiceOutcome Complete(string lessonId, Lesson[] lessons, string[] completedLessonIds)
    {
        return new ServiceOutcome("completed", Array.Empty<string>());
    }
}
