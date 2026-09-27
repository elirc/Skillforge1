public sealed record PaymentRequest(string Key, string Payload, int At);

public static class IdempotencyStore
{
    public static List<string> Handle(List<PaymentRequest> requests, int ttlSeconds)
    {
        var store = new Dictionary<string, (string Payload, int At, int Number)>();
        var responses = new List<string>();
        var created = 0;

        foreach (var request in requests)
        {
            if (string.IsNullOrWhiteSpace(request.Key))
            {
                responses.Add("400 missing key");
                continue;
            }

            if (store.TryGetValue(request.Key, out var entry) && request.At < entry.At + ttlSeconds)
            {
                responses.Add(entry.Payload == request.Payload
                    ? $"200 replay #{entry.Number}"
                    : "422 key reused with different payload");
                continue;
            }

            created++;
            store[request.Key] = (request.Payload, request.At, created);
            responses.Add($"201 created #{created}");
        }

        return responses;
    }
}
