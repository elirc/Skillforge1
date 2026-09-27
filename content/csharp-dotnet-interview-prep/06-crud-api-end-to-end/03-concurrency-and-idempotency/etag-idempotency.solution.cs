public sealed record ApiRequest(string Method, string? Id, string? IfMatch, string? IdempotencyKey, string? Body);
public sealed record ApiResponse(int Status, string? Id, string? ETag);

public static class NotesApi
{
    public static List<ApiResponse> Process(ApiRequest[] requests)
    {
        var store = new Dictionary<string, (string? Body, int Version)>();
        var idempotency = new Dictionary<string, (string? Body, ApiResponse Response)>();
        var nextId = 1;

        string ETagFor(int version) => "v" + version;

        ApiResponse Post(ApiRequest request)
        {
            var key = request.IdempotencyKey;
            if (key is not null && idempotency.TryGetValue(key, out var saved))
            {
                // Same key and same payload: a retry. Replay the original response.
                // Same key, different payload: the client has a bug.
                return saved.Body == request.Body ? saved.Response : new ApiResponse(422, null, null);
            }

            var id = "n" + nextId++;
            store[id] = (request.Body, 1);
            var response = new ApiResponse(201, id, ETagFor(1));
            if (key is not null)
            {
                idempotency[key] = (request.Body, response);
            }
            return response;
        }

        ApiResponse Put(ApiRequest request)
        {
            if (request.IfMatch is null)
            {
                return new ApiResponse(428, request.Id, null);
            }

            if (request.Id is null || !store.TryGetValue(request.Id, out var current))
            {
                return new ApiResponse(404, request.Id, null);
            }

            if (request.IfMatch != ETagFor(current.Version))
            {
                // Someone else changed it. Hand back the current ETag so the client can refetch.
                return new ApiResponse(412, request.Id, ETagFor(current.Version));
            }

            var version = current.Version + 1;
            store[request.Id] = (request.Body, version);
            return new ApiResponse(200, request.Id, ETagFor(version));
        }

        ApiResponse Get(ApiRequest request) =>
            request.Id is not null && store.TryGetValue(request.Id, out var current)
                ? new ApiResponse(200, request.Id, ETagFor(current.Version))
                : new ApiResponse(404, request.Id, null);

        return requests
            .Select(request => request.Method switch
            {
                "POST" => Post(request),
                "PUT" => Put(request),
                "GET" => Get(request),
                _ => new ApiResponse(405, request.Id, null),
            })
            .ToList();
    }
}
