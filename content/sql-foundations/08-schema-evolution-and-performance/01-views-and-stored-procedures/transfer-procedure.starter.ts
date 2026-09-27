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
  // Run the checks in the order the procedure does. On any failure return the balances unchanged.
  // Never mutate the input array or its objects.
  return { status: "ok", accounts };
}
