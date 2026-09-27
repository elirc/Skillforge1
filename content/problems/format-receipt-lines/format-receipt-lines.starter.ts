type ReceiptItem = { name: string; cents: number };

export function formatReceipt(items: ReceiptItem[], width: number) {
  // Wrap each name, right-align its price on the last line if it fits,
  // then add a line of dashes and a TOTAL line.
}
