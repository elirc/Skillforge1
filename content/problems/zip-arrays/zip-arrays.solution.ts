export function zipArrays(left: unknown[], right: unknown[]): unknown[][] {
  const length = Math.min(left.length, right.length);
  const pairs: unknown[][] = [];
  for (let index = 0; index < length; index += 1) {
    pairs.push([left[index], right[index]]);
  }
  return pairs;
}
