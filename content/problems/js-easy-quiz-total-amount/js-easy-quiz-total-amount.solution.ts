type AmountRow = { amount: number };

export function quizTotalAmount(rows: AmountRow[]): number {
  return rows.reduce((total, row) => total + row.amount, 0);
}
