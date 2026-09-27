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

export function replayCart(actions: CartAction[]) {
  // Start from an empty cart and apply each action with a reducer that
  // switches on action.type. Recompute subtotal, discount, and total after
  // every action. See the prompt for each action's rules.
}
