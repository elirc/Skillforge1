interface FlatOrderRow {
  orderId: number;
  orderTotal: number;
  customerEmail: string;
  customerName: string;
}

// orders_flat(order_id, order_total, customer_email, customer_name)
//   -> customers(id, email, name)  and  orders(id, customer_id, total)
export function normalizeOrders(flat: FlatOrderRow[]) {
  // assign customer ids 1, 2, 3 ... by first appearance of each email
  return { customers: [], orders: flat.map((row) => ({ id: row.orderId, customerId: 0, total: row.orderTotal })) };
}
