type AmountRow = { amount: number };

export function temperatureTotalAmount(rows: AmountRow[]): number {
  return rows.reduce((total, row) => total + row.amount, 0);
}
