public sealed record ApiRequest(string Method, string? Id, string? IfMatch, string? IdempotencyKey, string? Body);
public sealed record ApiResponse(int Status, string? Id, string? ETag);

public static class NotesApi
{
    // Process a sequence of HTTP requests against an in-memory notes store and
    // return one response per request. Each note has a version that starts at 1
    // and goes up by one on every successful PUT. Its ETag is "v" + version.
    // (Real ETags are quoted, like "\"3\""; plain strings keep the tests readable.)
    //
    // POST (create):
    //   - New ids are "n1", "n2", ... in creation order -> 201 (Id, "v1").
    //   - With an IdempotencyKey seen before:
    //       same Body      -> replay the ORIGINAL response exactly, create nothing;
    //       different Body -> 422 (null, null).
    //   - Without a key every POST creates a new note.
    // PUT (update with optimistic concurrency), checked in this order:
    //   - IfMatch is null                  -> 428 Precondition Required (Id, null)
    //   - no note with that Id             -> 404 (Id, null)
    //   - IfMatch is not the current ETag  -> 412 Precondition Failed (Id, currentETag)
    //   - otherwise store Body, bump the version -> 200 (Id, newETag)
    // GET: 200 (Id, currentETag) or 404 (Id, null).
    // Any other Method: 405 (Id, null).
    public static List<ApiResponse> Process(ApiRequest[] requests)
    {
        return requests.Select(request => new ApiResponse(200, request.Id, null)).ToList();
    }
}
