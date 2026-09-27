public sealed record Caller(string? UserId, string[] Roles);
public sealed record GradeRequest(string? ReviewStateId, int Grade, int ElapsedMs);
public sealed record ReviewStateRow(string Id, string UserId);
public sealed record Decision(int Status, string[] Errors);

public static class GradeReviewPolicy
{
    // Decide what "POST /reviews/grade" should answer, applying the checks in the
    // same order the ASP.NET Core pipeline would:
    //   1. Authentication - caller.UserId null or blank             -> 401
    //   2. Policy         - caller.Roles lacks "learner"            -> 403
    //   3. Validation     - collect EVERY failing rule, in this order -> 400 with Errors:
    //        "ReviewStateId is required."      (null or blank)
    //        "Grade must be between 0 and 5."  (inclusive range)
    //        "ElapsedMs must not be negative."
    //   4. Resource authz - no row with that Id owned by the caller  -> 404
    //      (someone else's row is also 404: do not reveal that it exists)
    //   5. Otherwise 200.
    // Errors is empty for every status except 400.
    public static Decision Evaluate(Caller caller, GradeRequest request, ReviewStateRow[] rows)
    {
        return new Decision(200, Array.Empty<string>());
    }
}
