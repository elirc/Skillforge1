interface IncomingCall {
  client: string; // an API key or user id
  at: number; // arrival time in whole seconds
}

// A fixed-window rate limiter: each client may make `limit` requests per window.
// A window starts at a multiple of windowSeconds:
//   windowStart = Math.floor(at / windowSeconds) * windowSeconds
// Each client has its own counter, and the counter starts over in each new window.
//
// Process the calls in order and return one result per call:
// - under the limit: count it and return { status: 200, remaining } where remaining
//   is how many more calls this client may make in this window.
// - over the limit: return { status: 429, retryAfter } where retryAfter is the whole
//   seconds until the window ends (windowStart + windowSeconds - at). A rejected call
//   does NOT use up quota.
export function rateLimit(calls: IncomingCall[], limit: number, windowSeconds: number) {
}
