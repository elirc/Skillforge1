const ENTITIES = ["user", "order", "invoice"] as const;
const ACTIONS = ["created", "updated", "deleted"] as const;

type Entity = (typeof ENTITIES)[number];
type Action = (typeof ACTIONS)[number];

type EventName = `${Entity}.${Action}`;

const LABELS = {
  user: "User",
  order: "Order",
  invoice: "Invoice",
} satisfies Record<Entity, string>;

type ParsedEvent = { name: EventName; entity: Entity; action: Action; label: string };

function isEntity(value: string): value is Entity {
  return (ENTITIES as readonly string[]).includes(value);
}

function isAction(value: string): value is Action {
  return (ACTIONS as readonly string[]).includes(value);
}

export function parseEventName(raw: string): ParsedEvent | null {
  const parts = raw.trim().split(".");
  if (parts.length !== 2) return null;
  const [entity, action] = parts;
  if (!isEntity(entity) || !isAction(action)) return null;
  const name: EventName = `${entity}.${action}`;
  return { name, entity, action, label: `${LABELS[entity]} ${action}` };
}
