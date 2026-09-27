interface AccountRow {
  id: number;
  balance: number;
}

// CREATE PROCEDURE dbo.TransferFunds @FromId int, @ToId int, @Amount int AS
// BEGIN
//   SET XACT_ABORT ON;
//   IF @Amount <= 0            RETURN 1;  -- invalid-amount
//   IF @FromId = @ToId         RETURN 2;  -- same-account
//   IF (SELECT COUNT(*) FROM accounts WHERE id IN (@FromId, @ToId)) < 2 RETURN 3;  -- unknown-account
//   BEGIN TRAN;
//     UPDATE accounts SET balance = balance - @Amount WHERE id = @FromId AND balance >= @Amount;
//     IF @@ROWCOUNT = 0 BEGIN ROLLBACK; RETURN 4; END  -- insufficient-funds
//     UPDATE accounts SET balance = balance + @Amount WHERE id = @ToId;
//   COMMIT;
//   RETURN 0;  -- ok
// END
export function transferFunds(accounts: AccountRow[], fromId: number, toId: number, amount: number) {
  const unchanged = accounts.map((a) => ({ ...a }));
  if (!Number.isInteger(amount) || amount <= 0) return { status: "invalid-amount", accounts: unchanged };
  if (fromId === toId) return { status: "same-account", accounts: unchanged };

  const from = accounts.find((a) => a.id === fromId);
  const to = accounts.find((a) => a.id === toId);
  if (!from || !to) return { status: "unknown-account", accounts: unchanged };
  if (from.balance < amount) return { status: "insufficient-funds", accounts: unchanged };

  // Both updates happen together or not at all; the caller's array is never mutated.
  const updated = accounts.map((a) => {
    if (a.id === fromId) return { ...a, balance: a.balance - amount };
    if (a.id === toId) return { ...a, balance: a.balance + amount };
    return { ...a };
  });
  return { status: "ok", accounts: updated };
}
