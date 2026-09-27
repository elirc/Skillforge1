type ApiRequest = { t: number; cost: number };

export function tokenBucket(capacity: number, refillPerSecond: number, requests: ApiRequest[]): boolean[] {
  // Milli-tokens: refilling for `ms` milliseconds adds exactly ms * rate of them.
  const max = capacity * 1000;
  let tokens = max;
  let last = 0;

  return requests.map(({ t, cost }) => {
    tokens = Math.min(max, tokens + (t - last) * refillPerSecond);
    last = t;
    if (tokens >= cost * 1000) {
      tokens -= cost * 1000;
      return true;
    }
    return false;
  });
}
