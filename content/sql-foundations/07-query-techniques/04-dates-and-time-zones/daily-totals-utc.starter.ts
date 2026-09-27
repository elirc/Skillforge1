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
  // Bug on purpose: slicing the raw string uses the LOCAL date written in the timestamp.
  // Parse it, convert to UTC with toISOString(), and skip timestamps that do not parse.
  const buckets = new Map<string, { day: string; totalCents: number; payments: number }>();
  for (const e of events) {
    const day = e.at.slice(0, 10);
    const bucket = buckets.get(day) ?? { day, totalCents: 0, payments: 0 };
    bucket.totalCents += e.amountCents;
    bucket.payments += 1;
    buckets.set(day, bucket);
  }
  return [...buckets.values()];
}
