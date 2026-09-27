interface Item {
  price: number;
  qty: number;
}

interface Order {
  items: Item[];
  shipping: string;
  coupon: string | null;
}

type Totals = { subtotal: number; discount: number; shipping: number; total: number } | { error: string };

// TODO: replace this if/else with strategy tables:
//   shipping: standard (free when subtotal - discount >= 50, else 4.99), express 12.5, pickup 0
//   discounts: SAVE10 (10% of subtotal), FLAT5 (5 off, never more than the subtotal)
// Unknown shipping -> { error: "unknown shipping: <name>" }
// Unknown coupon   -> { error: "unknown coupon: <code>" }
// Round money to 2 decimals.
function checkout(order: Order): Totals {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  let shipping = 0;
  if (order.shipping === "standard") shipping = 4.99;
  return { subtotal, discount: 0, shipping, total: subtotal + shipping };
}

export function checkoutTotals(orders: Order[]): Totals[] {
  return orders.map(checkout);
}
