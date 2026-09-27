public sealed record Caller(string? UserId, string[] Roles);
public sealed record GradeRequest(string? ReviewStateId, int Grade, int ElapsedMs);
public sealed record ReviewStateRow(string Id, string UserId);
public sealed record Decision(int Status, string[] Errors);

public static class GradeReviewPolicy
{
    public static Decision Evaluate(Caller caller, GradeRequest request, ReviewStateRow[] rows)
    {
        // 1. Authentication: who are you?
        if (string.IsNullOrWhiteSpace(caller.UserId))
        {
            return new Decision(401, Array.Empty<string>());
        }

        // 2. Policy authorization: may someone like you call this endpoint at all?
        if (!caller.Roles.Contains("learner"))
        {
            return new Decision(403, Array.Empty<string>());
        }

        // 3. Validation: is the input shaped correctly? Report every problem at once.
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(request.ReviewStateId)) errors.Add("ReviewStateId is required.");
        if (request.Grade < 0 || request.Grade > 5) errors.Add("Grade must be between 0 and 5.");
        if (request.ElapsedMs < 0) errors.Add("ElapsedMs must not be negative.");
        if (errors.Count > 0)
        {
            return new Decision(400, errors.ToArray());
        }

        // 4. Resource authorization: do you own THIS row? Match on id AND owner, and
        //    answer 404 for someone else's row so ids cannot be probed.
        var owned = rows.Any(row => row.Id == request.ReviewStateId && row.UserId == caller.UserId);
        return owned ? new Decision(200, Array.Empty<string>()) : new Decision(404, Array.Empty<string>());
    }
}
