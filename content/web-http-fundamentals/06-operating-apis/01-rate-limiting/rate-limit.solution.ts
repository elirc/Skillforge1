interface IncomingCall {
  client: string;
  at: number;
}

type LimitResult = { status: 200; remaining: number } | { status: 429; retryAfter: number };

export function rateLimit(calls: IncomingCall[], limit: number, windowSeconds: number): LimitResult[] {
  const counters = new Map<string, { windowStart: number; count: number }>();
  return calls.map((call) => {
    const windowStart = Math.floor(call.at / windowSeconds) * windowSeconds;
    let counter = counters.get(call.client);
    if (!counter || counter.windowStart !== windowStart) {
      counter = { windowStart, count: 0 };
      counters.set(call.client, counter);
    }
    if (counter.count >= limit) {
      return { status: 429, retryAfter: windowStart + windowSeconds - call.at };
    }
    counter.count += 1;
    return { status: 200, remaining: limit - counter.count };
  });
}
