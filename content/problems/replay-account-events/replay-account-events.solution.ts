type LedgerEvent = {
  seq: number;
  account: string;
  type: "opened" | "deposited" | "withdrew" | "closed";
  amount: number;
};

export function replayLedger(events: LedgerEvent[]) {
  const accounts = new Map<string, { open: boolean; balance: number }>();
  const applied = new Set<number>();
  const rejected: number[] = [];

  // A stable sort keeps the first delivery of a seq ahead of its duplicates.
  for (const event of [...events].sort((a, b) => a.seq - b.seq)) {
    if (applied.has(event.seq)) continue;
    applied.add(event.seq);

    const account = accounts.get(event.account);
    let ok = true;
    switch (event.type) {
      case "opened":
        if (account) ok = false;
        else accounts.set(event.account, { open: true, balance: 0 });
        break;
      case "deposited":
        if (!account?.open) ok = false;
        else account.balance += event.amount;
        break;
      case "withdrew":
        if (!account?.open || account.balance < event.amount) ok = false;
        else account.balance -= event.amount;
        break;
      case "closed":
        if (!account?.open || account.balance !== 0) ok = false;
        else account.open = false;
        break;
    }
    if (!ok) rejected.push(event.seq);
  }

  const balances: Record<string, number> = {};
  for (const name of [...accounts.keys()].sort()) {
    const account = accounts.get(name)!;
    if (account.open) balances[name] = account.balance;
  }
  return { balances, rejected };
}
