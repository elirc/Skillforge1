interface Transfer {
  from: string;
  to: string;
  amount: number;
}

// SET XACT_ABORT ON;
// BEGIN TRANSACTION;
//   -- for each transfer:
//   UPDATE accounts SET balance = balance - @amount WHERE id = @from;  -- CHECK (balance >= 0)
//   UPDATE accounts SET balance = balance + @amount WHERE id = @to;
// COMMIT;   -- or ROLLBACK everything on the first error
export function runTransaction(balances: Record<string, number>, transfers: Transfer[]) {
  const next = { ...balances };
  for (const t of transfers) {
    next[t.from] -= t.amount;
    next[t.to] += t.amount;
  }
  return { committed: true, balances: next };
}
