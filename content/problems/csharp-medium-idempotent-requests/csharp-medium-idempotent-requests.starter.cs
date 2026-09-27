public sealed record PaymentRequest(string Key, string Payload, int At);

public static class IdempotencyStore
{
    // Remember key -> (payload, time, payment number). Answer 400 / 201 / 200 / 422
    // as described, treating entries older than ttlSeconds as expired.
    public static List<string> Handle(List<PaymentRequest> requests, int ttlSeconds)
    {
        throw new NotImplementedException();
    }
}
