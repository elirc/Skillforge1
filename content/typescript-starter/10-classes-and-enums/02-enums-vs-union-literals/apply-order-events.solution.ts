const ORDER_EVENTS = ["pay", "ship", "deliver", "cancel"] as const;
type OrderEvent = (typeof ORDER_EVENTS)[number];
type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

const NEXT: Record<OrderStatus, Partial<Record<OrderEvent, OrderStatus>>> = {
  pending: { pay: "paid", cancel: "cancelled" },
  paid: { ship: "shipped", cancel: "cancelled" },
  shipped: { deliver: "delivered" },
  delivered: {},
  cancelled: {},
};

function isOrderEvent(value: string): value is OrderEvent {
  return (ORDER_EVENTS as readonly string[]).includes(value);
}

export function applyOrderEvents(events: string[]): { status: OrderStatus; errors: string[] } {
  let status: OrderStatus = "pending";
  const errors: string[] = [];
  for (const event of events) {
    if (!isOrderEvent(event)) {
      errors.push("unknown event: " + event);
      continue;
    }
    const next: OrderStatus | undefined = NEXT[status][event];
    if (next === undefined) errors.push("cannot " + event + " when " + status);
    else status = next;
  }
  return { status, errors };
}
