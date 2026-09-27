interface CorsPolicy {
  allowedOrigins: string[]; // exact origins like "https://app.test", or "*"
  allowedMethods: string[]; // uppercase, e.g. ["GET", "POST", "PUT"]
  allowedHeaders: string[]; // e.g. ["Content-Type", "Authorization"]
  allowCredentials: boolean;
  maxAgeSeconds: number;
}

// Answer a CORS preflight (OPTIONS) request. `headers` has lowercase names:
//   origin, access-control-request-method, and optionally access-control-request-headers
//   (a comma-separated list).
//
// Reject (return { allowed: false, reason }) checking in this order:
// 1. allowedOrigins contains "*" and allowCredentials is true
//    -> "Wildcard origin cannot be combined with credentials"
// 2. the origin is not listed and there is no "*"  -> "Origin not allowed"
// 3. the requested method (compare uppercase) is not in allowedMethods -> "Method not allowed"
// 4. a requested header (trimmed, lowercased, empties dropped) is not in allowedHeaders
//    (compare lowercase) -> "Header '<name>' not allowed" for the first such header
//
// Otherwise return { allowed: true, status: 204, headers } where headers holds, in order:
//   "Access-Control-Allow-Origin": "*" when the policy uses "*", else the request's origin
//   "Access-Control-Allow-Methods": allowedMethods joined with ", "
//   "Access-Control-Allow-Headers": the requested headers (lowercased) joined with ", "
//                                   (only when at least one was requested)
//   "Access-Control-Allow-Credentials": "true" (only when allowCredentials)
//   "Access-Control-Max-Age": maxAgeSeconds as a string
//   "Vary": "Origin" (only when echoing a specific origin)
export function preflightResponse(policy: CorsPolicy, headers: Record<string, string>) {
}
