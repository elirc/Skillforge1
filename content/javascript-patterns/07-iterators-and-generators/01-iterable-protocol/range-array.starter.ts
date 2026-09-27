function range(start: number, end: number, step: number): Iterable<number> {
  return {
    [Symbol.iterator]() {
      // Return an iterator: an object whose next() returns
      // { value, done: false } for start, start + step, ... while below `end`,
      // then { value: undefined, done: true }. A step <= 0 yields nothing.
      return {
        next(): IteratorResult<number> {
          return { value: undefined, done: true };
        },
      };
    },
  };
}

export function rangeArray(start: number, end: number, step: number): number[] {
  return [...range(start, end, step)];
}
