function* naturals(): Generator<number> {
  let n = 1;
  while (true) yield n++;
}

function* filter<T>(source: Iterable<T>, keep: (value: T) => boolean): Generator<T> {
  // Yield only the values from `source` for which keep(value) is true.
}

function* take<T>(source: Iterable<T>, count: number): Generator<T> {
  // Yield at most `count` values from `source`, then stop. Because naturals()
  // never ends, you must return as soon as you have enough (and yield nothing
  // for count <= 0).
}

export function firstMultiples(count: number, divisor: number): number[] {
  return [...take(filter(naturals(), (n) => n % divisor === 0), count)];
}
