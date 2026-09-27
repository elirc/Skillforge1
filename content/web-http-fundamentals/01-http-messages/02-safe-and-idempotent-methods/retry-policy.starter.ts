interface OutgoingRequest {
  method: string;
  headers: Record<string, string>;
}

// Classify a request the way an HTTP client library decides whether it may
// retry automatically after a timeout. Return { safe, idempotent, autoRetry }.
//
// - safe: GET, HEAD, OPTIONS, TRACE (no intended change on the server).
// - idempotent: every safe method, plus PUT and DELETE.
// - autoRetry: true when the method is idempotent, OR when it is POST or PATCH
//   and the request carries a non-empty Idempotency-Key header (header names
//   are case-insensitive; ignore surrounding whitespace in the value).
// Method names may arrive in any case.
export function retryPolicy(request: OutgoingRequest) {
}
