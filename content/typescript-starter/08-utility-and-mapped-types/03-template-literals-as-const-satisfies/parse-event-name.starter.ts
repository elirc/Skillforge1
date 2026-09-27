// as const keeps the literal strings, so typeof ENTITIES[number] is
// "user" | "order" | "invoice" instead of string.
const ENTITIES = ["user", "order", "invoice"] as const;
const ACTIONS = ["created", "updated", "deleted"] as const;

type Entity = (typeof ENTITIES)[number];
type Action = (typeof ACTIONS)[number];

// A template literal type: every combination such as "order.created".
type EventName = `${Entity}.${Action}`;

// satisfies checks that every Entity has a label without widening the
// object's own type (hover LABELS: its values stay literal strings).
const LABELS = {
  user: "User",
  order: "Order",
  invoice: "Invoice",
} satisfies Record<Entity, string>;

type ParsedEvent = { name: EventName; entity: Entity; action: Action; label: string };

// Parse a raw event name from a message queue.
export function parseEventName(raw: string) {
  // 1. Trim raw. It must be exactly "<entity>.<action>" with one dot.
  // 2. Both parts must be in ENTITIES / ACTIONS (case-sensitive).
  // 3. Return { name, entity, action, label } where label is e.g. "Order created"
  //    (LABELS[entity] + " " + action), or null when raw is not a known event.
}
