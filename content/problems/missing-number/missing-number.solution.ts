export function missingNumber(numbers: number[]): number {
  const n = numbers.length;
  const expected = (n * (n + 1)) / 2;
  const actual = numbers.reduce((sum, value) => sum + value, 0);
  return expected - actual;
}
