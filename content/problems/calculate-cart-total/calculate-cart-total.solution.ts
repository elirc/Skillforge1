type CartLine = { quantity: number; unitPrice: number };

export function calculateCartTotal(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);
}
