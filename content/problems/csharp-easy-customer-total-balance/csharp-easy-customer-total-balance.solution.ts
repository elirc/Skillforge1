type Customer = { balance: number };

export function customerTotalBalance(items: Customer[]): number {
  return items.reduce((total, item) => total + item.balance, 0);
}
