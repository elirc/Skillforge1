interface PaymentRow {
  id: number;
  customerId: number;
  paidAt: string;
  amount: number;
}

// SELECT id, customer_id,
//        SUM(amount) OVER (PARTITION BY customer_id ORDER BY paid_at, id
//                          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,
//        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY paid_at, id) AS payment_number
// FROM payments
// ORDER BY customer_id, paid_at, id
export function runningTotals(payments: PaymentRow[]) {
  const sorted = [...payments].sort(
    (a, b) => a.customerId - b.customerId || (a.paidAt < b.paidAt ? -1 : a.paidAt > b.paidAt ? 1 : 0) || a.id - b.id,
  );

  let currentCustomer: number | null = null;
  let runningTotal = 0;
  let paymentNumber = 0;

  return sorted.map((p) => {
    // A new partition resets the window.
    if (p.customerId !== currentCustomer) {
      currentCustomer = p.customerId;
      runningTotal = 0;
      paymentNumber = 0;
    }
    runningTotal += p.amount;
    paymentNumber += 1;
    return { id: p.id, customerId: p.customerId, runningTotal, paymentNumber };
  });
}
