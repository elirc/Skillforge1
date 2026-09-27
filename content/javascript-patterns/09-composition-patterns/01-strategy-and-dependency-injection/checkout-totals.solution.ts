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
type Strategy = (amount: number) => number;

const round2 = (value: number) => Math.round(value * 100) / 100;

const shippingStrategies: Record<string, Strategy> = {
  standard: (afterDiscount) => (afterDiscount >= 50 ? 0 : 4.99),
  express: () => 12.5,
  pickup: () => 0,
};

const discountStrategies: Record<string, Strategy> = {
  SAVE10: (subtotal) => round2(subtotal * 0.1),
  FLAT5: (subtotal) => Math.min(5, subtotal),
};

function createCheckout(deps: { shipping: Record<string, Strategy>; discounts: Record<string, Strategy> }) {
  return function checkout(order: Order): Totals {
    const shippingFor = Object.hasOwn(deps.shipping, order.shipping) ? deps.shipping[order.shipping] : undefined;
    if (!shippingFor) return { error: "unknown shipping: " + order.shipping };

    let discountFor: Strategy = () => 0;
    if (order.coupon !== null) {
      if (!Object.hasOwn(deps.discounts, order.coupon)) return { error: "unknown coupon: " + order.coupon };
      discountFor = deps.discounts[order.coupon];
    }

    const subtotal = round2(order.items.reduce((sum, item) => sum + item.price * item.qty, 0));
    const discount = discountFor(subtotal);
    const shipping = shippingFor(subtotal - discount);
    return { subtotal, discount, shipping, total: round2(subtotal - discount + shipping) };
  };
}

export function checkoutTotals(orders: Order[]): Totals[] {
  const checkout = createCheckout({ shipping: shippingStrategies, discounts: discountStrategies });
  return orders.map(checkout);
}
