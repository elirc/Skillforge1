type Emits = { event: string; payload: string };
type Op =
  | { op: "on" | "once"; event: string; id: string; emits?: Emits }
  | { op: "off"; event: string; id: string }
  | { op: "emit"; event: string; payload: string };

type Listener = { id: string; event: string; once: boolean; fired: boolean; emits?: Emits };

const MAX_DEPTH = 10;

export function replayEmitter(ops: Op[]): string[] {
  const listeners = new Map<string, Listener[]>();
  const log: string[] = [];

  const detach = (event: string, match: (listener: Listener) => boolean) => {
    const list = listeners.get(event);
    if (!list) return;
    const index = list.findIndex(match);
    if (index >= 0) list.splice(index, 1);
  };

  const emit = (event: string, payload: string, depth: number) => {
    if (depth > MAX_DEPTH) {
      log.push(`overflow:${event}`);
      return;
    }
    // Snapshot: subscriptions changed during this dispatch do not affect it.
    const snapshot = [...(listeners.get(event) ?? [])];
    if (event !== "*") snapshot.push(...(listeners.get("*") ?? []));
    if (snapshot.length === 0) {
      log.push(`unhandled:${event}`);
      return;
    }
    for (const listener of snapshot) {
      if (listener.once) {
        // A once listener may already have fired inside a nested dispatch.
        if (listener.fired) continue;
        listener.fired = true;
        detach(listener.event, (candidate) => candidate === listener);
      }
      log.push(`${listener.id}:${event}:${payload}`);
      if (listener.emits) emit(listener.emits.event, listener.emits.payload, depth + 1);
    }
  };

  for (const op of ops) {
    if (op.op === "emit") {
      emit(op.event, op.payload, 1);
    } else if (op.op === "off") {
      detach(op.event, (listener) => listener.id === op.id);
    } else {
      const list = listeners.get(op.event) ?? [];
      if (list.some((listener) => listener.id === op.id)) continue;
      list.push({ id: op.id, event: op.event, once: op.op === "once", fired: false, emits: op.emits });
      listeners.set(op.event, list);
    }
  }

  return log;
}
