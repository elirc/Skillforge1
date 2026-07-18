type Customer = { id: string; name: string; isActive: boolean };

export function customerApplyUpdate(item: Customer, update: Partial<Customer>): Customer {
  return { ...item, ...update };
}
