interface PaymentEvent {
  id: number;
  at: string; // ISO-8601 timestamp, possibly with an offset like -05:00
  amountCents: number;
}

// -- created_at is stored in UTC, so the day bucket is the UTC calendar day
// SELECT CAST(created_at AS date) AS day, SUM(amount_cents) AS total_cents, COUNT(*) AS payments
// FROM payments
// GROUP BY CAST(created_at AS date)
// ORDER BY day;
export function dailyTotalsUtc(events: PaymentEvent[]) {
  const buckets = new Map<string, { day: string; totalCents: number; payments: number }>();
  for (const e of events) {
    const ms = Date.parse(e.at);
    if (Number.isNaN(ms)) continue; // unparseable timestamps never reach a bucket
    // Normalize to UTC first, then cut to the date part.
    const day = new Date(ms).toISOString().slice(0, 10);
    const bucket = buckets.get(day) ?? { day, totalCents: 0, payments: 0 };
    bucket.totalCents += e.amountCents;
    bucket.payments += 1;
    buckets.set(day, bucket);
  }
  return [...buckets.values()].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
}
