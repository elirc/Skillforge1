interface CustomerRow {
  id: number;
  name: string;
}

interface OrderRow {
  id: number;
  customerId: number | null;
  status: string;
}

// -- semi-join: each customer at most once, however many orders match
// SELECT c.name FROM customers c
// WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'paid')
// ORDER BY c.name;
//
// -- anti-join: NOT EXISTS is safe even when orders.customer_id contains NULL
// SELECT c.name FROM customers c
// WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'paid')
// ORDER BY c.name;
export function existsSplit(customers: CustomerRow[], orders: OrderRow[]) {
  const paidCustomerIds = new Set(
    orders.filter((o) => o.status === "paid" && o.customerId !== null).map((o) => o.customerId),
  );
  const byName = (a: CustomerRow, b: CustomerRow) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const sorted = [...customers].sort(byName);
  return {
    withPaidOrders: sorted.filter((c) => paidCustomerIds.has(c.id)).map((c) => c.name),
    withoutPaidOrders: sorted.filter((c) => !paidCustomerIds.has(c.id)).map((c) => c.name),
  };
}
