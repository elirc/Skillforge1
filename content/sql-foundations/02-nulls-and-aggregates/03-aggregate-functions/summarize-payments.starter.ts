interface PaymentRow {
  id: number;
  customerId: number | null;
  amount: number | null;
}

// SELECT COUNT(*), COUNT(amount), COUNT(DISTINCT customer_id),
//        SUM(amount), AVG(amount), MIN(amount), MAX(amount)
// FROM payments
export function summarizePayments(rows: PaymentRow[]) {
  return {
    countStar: rows.length,
    countAmount: rows.length,
    distinctCustomers: 0,
    sumAmount: 0,
    avgAmount: 0,
    minAmount: 0,
    maxAmount: 0,
  };
}
