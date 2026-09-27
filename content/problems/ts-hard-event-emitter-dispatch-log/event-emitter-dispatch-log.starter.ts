type Emits = { event: string; payload: string };
type Op =
  | { op: "on" | "once"; event: string; id: string; emits?: Emits }
  | { op: "off"; event: string; id: string }
  | { op: "emit"; event: string; payload: string };

export function replayEmitter(ops: Op[]) {
  // Keep a Map<event, listener[]> in subscription order ("*" is the wildcard list).
  // For each emit:
  //   - past depth 10, log "overflow:<event>" and stop that branch
  //   - snapshot the event's listeners followed by the "*" listeners
  //   - no listeners at all: log "unhandled:<event>"
  //   - for each listener: log "<id>:<event>:<payload>"; a once listener is
  //     removed before it runs and never runs twice; if it has `emits`,
  //     dispatch that event immediately (depth + 1) before the next listener
  // Subscribing the same id to the same event twice is a no-op.
}
