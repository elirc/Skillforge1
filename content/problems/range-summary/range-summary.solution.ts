export function rangeSummary(numbers: number[]): string[] {
  const ranges: string[] = [];
  let start = 0;

  for (let i = 0; i < numbers.length; i++) {
    const isEnd = i === numbers.length - 1 || numbers[i + 1] !== numbers[i] + 1;
    if (!isEnd) continue;

    const first = numbers[start];
    const last = numbers[i];
    ranges.push(first === last ? String(first) : `${first}->${last}`);
    start = i + 1;
  }

  return ranges;
}
