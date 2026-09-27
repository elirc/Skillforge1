function memoize(fn: (n: number) => number): (n: number) => number {
  const cache = new Map<number, number>();
  return (n) => {
    if (cache.has(n)) return cache.get(n) as number;
    const result = fn(n);
    cache.set(n, result);
    return result;
  };
}

export function memoStats(inputs: number[]): { results: number[]; calls: number } {
  let calls = 0;
  const slowSquare = (n: number) => {
    calls += 1;
    return n * n;
  };
  const fastSquare = memoize(slowSquare);
  const results = inputs.map((n) => fastSquare(n));
  return { results, calls };
}
