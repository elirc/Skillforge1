function memoize(fn: (n: number) => number): (n: number) => number {
  // Create a cache (a Map works well) in this closure. Return a function that
  // checks the cache first and only calls `fn` for inputs it has not seen.
  return fn;
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
