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
  // Work on a private copy: nothing is visible until COMMIT.
  const working = { ...balances };
  const rollback = { committed: false, balances: { ...balances } };

  for (const t of transfers) {
    if (!Object.prototype.hasOwnProperty.call(working, t.from) || !Object.prototype.hasOwnProperty.call(working, t.to)) {
      return rollback;
    }
    const debited = working[t.from] - t.amount;
    if (debited < 0) return rollback; // CHECK constraint violation aborts the transaction
    working[t.from] = debited;
    working[t.to] = working[t.to] + t.amount;
  }

  return { committed: true, balances: working };
}
