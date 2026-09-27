type ApiRequest = { t: number; cost: number };

export function tokenBucket(capacity: number, refillPerSecond: number, requests: ApiRequest[]) {
  // Refill lazily on each request, then allow if enough tokens remain.
  // Hint: count in thousandths of a token to avoid floating-point drift.
}
