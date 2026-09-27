interface Op {
  type: "deposit" | "withdraw";
  amount: number;
}

class Account {
  #balance = 0;

  get balance(): number {
    return this.#balance;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("amount must be positive");
    this.#balance += amount;
  }

  withdraw(amount: number): void {
    if (amount <= 0) throw new Error("amount must be positive");
    if (amount > this.#balance) throw new Error("insufficient funds");
    this.#balance -= amount;
  }
}

export function accountLog(ops: Op[]): (number | string)[] {
  const account = new Account();
  return ops.map((op) => {
    try {
      if (op.type === "deposit") account.deposit(op.amount);
      else account.withdraw(op.amount);
      return account.balance;
    } catch (error) {
      return (error as Error).message;
    }
  });
}
