interface Op {
  type: "deposit" | "withdraw";
  amount: number;
}

class Account {
  // Make this a private #balance field with a read-only `balance` getter.
  // deposit/withdraw must throw Error("amount must be positive") for amounts
  // <= 0, and withdraw must throw Error("insufficient funds") on overdraft.
  balance = 0;

  deposit(amount: number): void {
    this.balance += amount;
  }

  withdraw(amount: number): void {
    this.balance -= amount;
  }
}

export function accountLog(ops: Op[]): (number | string)[] {
  const account = new Account();
  // Record the balance after each op, or the error message if it threw.
  return ops.map((op) => {
    if (op.type === "deposit") account.deposit(op.amount);
    else account.withdraw(op.amount);
    return account.balance;
  });
}
