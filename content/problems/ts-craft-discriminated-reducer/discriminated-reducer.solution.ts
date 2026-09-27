type CartItem = { sku: string; name: string; unitCents: number; qty: number };
type CartState = {
  items: CartItem[];
  couponCode: string | null;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
};
type CartAction =
  | { type: "add"; sku: string; name: string; unitCents: number; qty?: number }
  | { type: "remove"; sku: string }
  | { type: "setQty"; sku: string; qty: number }
  | { type: "applyCoupon"; code: string }
  | { type: "removeCoupon" }
  | { type: "clear" };

const COUPONS = ["SAVE10", "FLAT5"];

function withTotals(items: CartItem[], couponCode: string | null): CartState {
  const subtotalCents = items.reduce((sum, item) => sum + item.unitCents * item.qty, 0);
  let discountCents = 0;
  if (couponCode === "SAVE10") discountCents = Math.floor(subtotalCents / 10);
  if (couponCode === "FLAT5" && subtotalCents >= 2000) discountCents = 500;
  return { items, couponCode, subtotalCents, discountCents, totalCents: Math.max(0, subtotalCents - discountCents) };
}

function reduce(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const qty = action.qty ?? 1;
      if (qty <= 0) return state;
      const existing = state.items.find((item) => item.sku === action.sku);
      const items = existing
        ? state.items.map((item) => (item.sku === action.sku ? { ...item, qty: item.qty + qty } : item))
        : [...state.items, { sku: action.sku, name: action.name, unitCents: action.unitCents, qty }];
      return withTotals(items, state.couponCode);
    }
    case "remove":
      return withTotals(
        state.items.filter((item) => item.sku !== action.sku),
        state.couponCode,
      );
    case "setQty": {
      const items =
        action.qty <= 0
          ? state.items.filter((item) => item.sku !== action.sku)
          : state.items.map((item) => (item.sku === action.sku ? { ...item, qty: action.qty } : item));
      return withTotals(items, state.couponCode);
    }
    case "applyCoupon": {
      const code = action.code.trim().toUpperCase();
      return COUPONS.includes(code) ? withTotals(state.items, code) : state;
    }
    case "removeCoupon":
      return withTotals(state.items, null);
    case "clear":
      return withTotals([], null);
    default:
      // Unknown actions (for example from a newer client) leave state unchanged.
      return state;
  }
}

export function replayCart(actions: CartAction[]): CartState {
  return actions.reduce(reduce, withTotals([], null));
}
