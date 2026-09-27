export function fewestVouchers(denominations: number[], amount: number): { count: number; vouchers: number[] } | null {
  const coins = [...new Set(denominations)].sort((a, b) => b - a);
  const best = new Array<number>(amount + 1).fill(Infinity);
  best[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const d of coins) {
      if (d <= a && best[a - d] + 1 < best[a]) best[a] = best[a - d] + 1;
    }
  }
  if (best[amount] === Infinity) return null;

  const vouchers: number[] = [];
  let left = amount;
  while (left > 0) {
    const d = coins.find((coin) => coin <= left && best[left - coin] === best[left] - 1)!;
    vouchers.push(d);
    left -= d;
  }
  return { count: vouchers.length, vouchers };
}
