function* naturals(): Generator<number> {
  let n = 1;
  while (true) yield n++;
}

function* filter<T>(source: Iterable<T>, keep: (value: T) => boolean): Generator<T> {
  for (const value of source) if (keep(value)) yield value;
}

function* take<T>(source: Iterable<T>, count: number): Generator<T> {
  if (count <= 0) return;
  let taken = 0;
  for (const value of source) {
    yield value;
    taken += 1;
    if (taken >= count) return;
  }
}

export function firstMultiples(count: number, divisor: number): number[] {
  return [...take(filter(naturals(), (n) => n % divisor === 0), count)];
}
