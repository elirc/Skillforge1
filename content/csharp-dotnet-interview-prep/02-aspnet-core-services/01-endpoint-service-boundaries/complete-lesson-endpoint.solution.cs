public sealed record Lesson(string Id, string[] ConceptTags);
public sealed record CompletionResponse(int Status, string Code, string[] SeededConcepts);
public sealed record ServiceOutcome(string Kind, string[] SeededConcepts);

public static class CompleteLessonEndpoint
{
    // The endpoint owns transport concerns: who is calling, whether the route
    // value is usable, and how a service outcome becomes an HTTP status.
    public static CompletionResponse Handle(string? claimUserId, string lessonId, Lesson[] lessons, string[] completedLessonIds)
    {
        if (string.IsNullOrWhiteSpace(claimUserId))
        {
            return new CompletionResponse(401, "unauthenticated", Array.Empty<string>());
        }

        if (string.IsNullOrWhiteSpace(lessonId))
        {
            return new CompletionResponse(400, "invalid-lesson-id", Array.Empty<string>());
        }

        var outcome = LessonCompletionService.Complete(lessonId, lessons, completedLessonIds);

        return outcome.Kind switch
        {
            "not-found" => new CompletionResponse(404, "lesson-not-found", Array.Empty<string>()),
            "already-completed" => new CompletionResponse(200, "already-completed", Array.Empty<string>()),
            _ => new CompletionResponse(200, "completed", outcome.SeededConcepts),
        };
    }
}

public static class LessonCompletionService
{
    // The service owns the use case and its invariant: completing a lesson
    // seeds review state for each of its concepts exactly once.
    public static ServiceOutcome Complete(string lessonId, Lesson[] lessons, string[] completedLessonIds)
    {
        var lesson = lessons.FirstOrDefault(candidate => candidate.Id == lessonId);
        if (lesson is null)
        {
            return new ServiceOutcome("not-found", Array.Empty<string>());
        }

        if (completedLessonIds.Contains(lessonId))
        {
            return new ServiceOutcome("already-completed", Array.Empty<string>());
        }

        var concepts = lesson.ConceptTags
            .Distinct(StringComparer.Ordinal)
            .OrderBy(tag => tag, StringComparer.Ordinal)
            .ToArray();

        return new ServiceOutcome("completed", concepts);
    }
}
