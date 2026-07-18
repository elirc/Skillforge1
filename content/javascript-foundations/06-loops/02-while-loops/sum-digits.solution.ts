export function sumDigits(n: number): number {
  let remaining = n;
  let total = 0;
  while (remaining > 0) {
    total += remaining % 10;
    remaining = Math.floor(remaining / 10);
  }
  return total;
}
