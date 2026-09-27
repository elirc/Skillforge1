interface FlatOrderRow {
  orderId: number;
  orderTotal: number;
  customerEmail: string;
  customerName: string;
}

// orders_flat(order_id, order_total, customer_email, customer_name)
//   -> customers(id, email, name)  and  orders(id, customer_id, total)
export function normalizeOrders(flat: FlatOrderRow[]) {
  const customers: { id: number; email: string; name: string }[] = [];
  const idByEmail = new Map<string, number>();

  const orders = flat.map((row) => {
    let customerId = idByEmail.get(row.customerEmail);
    if (customerId === undefined) {
      // Like an IDENTITY column: the next id goes to the next new customer.
      customerId = customers.length + 1;
      idByEmail.set(row.customerEmail, customerId);
      customers.push({ id: customerId, email: row.customerEmail, name: row.customerName });
    }
    return { id: row.orderId, customerId, total: row.orderTotal };
  });

  return { customers, orders };
}
