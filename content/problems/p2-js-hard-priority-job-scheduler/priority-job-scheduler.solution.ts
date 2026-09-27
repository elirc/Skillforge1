export type Job = { id: string; arrival: number; duration: number; priority: number };
type Slot = { id: string; worker: number; start: number; end: number };

class Heap<T> {
  private items: T[] = [];
  constructor(private readonly before: (a: T, b: T) => boolean) {}

  get size() {
    return this.items.length;
  }

  push(item: T) {
    const items = this.items;
    items.push(item);
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.before(items[i], items[parent])) break;
      [items[i], items[parent]] = [items[parent], items[i]];
      i = parent;
    }
  }

  pop(): T {
    const items = this.items;
    const top = items[0];
    const last = items.pop()!;
    if (items.length > 0) {
      items[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let best = i;
        if (l < items.length && this.before(items[l], items[best])) best = l;
        if (r < items.length && this.before(items[r], items[best])) best = r;
        if (best === i) break;
        [items[i], items[best]] = [items[best], items[i]];
        i = best;
      }
    }
    return top;
  }
}

export function schedule(jobs: Job[], workers: number): Slot[] {
  const incoming = [...jobs].sort((a, b) => a.arrival - b.arrival);
  const waiting = new Heap<Job>((a, b) =>
    a.priority !== b.priority ? a.priority > b.priority : a.arrival !== b.arrival ? a.arrival < b.arrival : a.id < b.id,
  );
  const freeAt = new Array<number>(workers).fill(-Infinity);
  const result: Slot[] = [];
  let next = 0;
  let t = incoming.length > 0 ? incoming[0].arrival : 0;

  while (next < incoming.length || waiting.size > 0) {
    while (next < incoming.length && incoming[next].arrival <= t) waiting.push(incoming[next++]);
    for (let w = 0; w < workers && waiting.size > 0; w++) {
      if (freeAt[w] <= t) {
        const job = waiting.pop();
        freeAt[w] = t + job.duration;
        result.push({ id: job.id, worker: w, start: t, end: freeAt[w] });
      }
    }
    let upcoming = next < incoming.length ? incoming[next].arrival : Infinity;
    if (waiting.size > 0) upcoming = Math.min(upcoming, ...freeAt.filter((free) => free > t));
    if (upcoming === Infinity) break;
    t = upcoming;
  }
  return result;
}
