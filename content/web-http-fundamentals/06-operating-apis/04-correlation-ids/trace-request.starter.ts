// Pick the correlation id for an incoming request so every log line, outgoing
// call, and error response for it can be tied together. `headers` has lowercase names.
//
// Priority:
// 1. A valid W3C "traceparent" header: "00-<trace-id>-<parent-id>-<flags>" where
//    trace-id is 32 lowercase hex chars, parent-id is 16, flags is 2, and neither
//    trace-id nor parent-id is all zeros. Use the trace-id. source: "traceparent"
// 2. An "x-correlation-id" header that, after trimming, is 1-64 characters of only
//    letters, digits, and "-". Use it. source: "header"
//    (Anything else is ignored: never copy arbitrary client text into your logs.)
// 3. Otherwise use generatedId. source: "generated"
//
// Return { correlationId, source, responseHeaders: { "X-Correlation-Id": correlationId } }.
export function traceRequest(headers: Record<string, string>, generatedId: string) {
}
