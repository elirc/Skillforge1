type Nested = number | Nested[];

// Add up every number in a list that may contain lists, which may contain lists...
export function sumNested(items: Nested[]): number {
  // This only handles numbers at the top level. When an item is an array
  // (Array.isArray(item)), call sumNested on it and add the result.
  let total = 0;
  for (const item of items) {
    if (typeof item === "number") total += item;
  }
  return total;
}
