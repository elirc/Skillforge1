type Nested = number | Nested[];

// Add up every number in a list that may contain lists, which may contain lists...
export function sumNested(items: Nested[]): number {
  let total = 0;
  for (const item of items) {
    if (Array.isArray(item)) {
      total += sumNested(item); // recursive case: a smaller list
    } else {
      total += item; // base case: a plain number
    }
  }
  return total;
}
