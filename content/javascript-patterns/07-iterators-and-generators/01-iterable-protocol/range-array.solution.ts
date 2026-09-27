function range(start: number, end: number, step: number): Iterable<number> {
  return {
    [Symbol.iterator]() {
      let current = start;
      return {
        next(): IteratorResult<number> {
          if (step <= 0 || current >= end) return { value: undefined, done: true };
          const value = current;
          current += step;
          return { value, done: false };
        },
      };
    },
  };
}

export function rangeArray(start: number, end: number, step: number): number[] {
  return [...range(start, end, step)];
}
