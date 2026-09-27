const ORDER_EVENTS = ["pay", "ship", "deliver", "cancel"] as const;
type OrderEvent = (typeof ORDER_EVENTS)[number];
type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

// Allowed transitions:
//   pending: pay -> paid, cancel -> cancelled
//   paid:    ship -> shipped, cancel -> cancelled
//   shipped: deliver -> delivered
//   delivered, cancelled: nothing
const NEXT: Record<OrderStatus, Partial<Record<OrderEvent, OrderStatus>>> = {
  pending: { pay: "paid" },
  paid: {},
  shipped: {},
  delivered: {},
  cancelled: {},
};

// TODO: fill in the table, reject strings that are not events with
// "unknown event: <name>", and reject illegal transitions with
// "cannot <event> when <status>" (the status stays the same).
export function applyOrderEvents(events: string[]): { status: OrderStatus; errors: string[] } {
  let status: OrderStatus = "pending";
  for (const event of events) {
    status = NEXT[status][event as OrderEvent] ?? status;
  }
  return { status, errors: [] };
}
