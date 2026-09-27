type InputEvent = { t: number; value: string };
type Burst = { value: string; first: number; last: number };

export function debounceTimeline(events: InputEvent[], wait: number, maxWait: number | null) {
  const calls: { t: number; value: string }[] = [];
  let pending: Burst | null = null;

  const deadline = (burst: Burst) =>
    maxWait === null ? burst.last + wait : Math.min(burst.last + wait, burst.first + maxWait);

  for (const event of events) {
    if (pending && event.t >= deadline(pending)) {
      calls.push({ t: deadline(pending), value: pending.value });
      pending = null;
    }
    if (pending) {
      pending.value = event.value;
      pending.last = event.t;
    } else {
      pending = { value: event.value, first: event.t, last: event.t };
    }
  }

  if (pending) calls.push({ t: deadline(pending), value: pending.value });
  return calls;
}
