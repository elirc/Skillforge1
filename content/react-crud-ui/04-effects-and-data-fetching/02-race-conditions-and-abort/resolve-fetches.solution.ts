type FetchEvent =
  | { type: "request"; id: number; query: string }
  | { type: "response"; id: number; results: string[] };

interface Outcome {
  shown: { query: string; results: string[] } | null;
  aborted: number[];
  applied: number[];
}

export function resolveFetches(events: FetchEvent[], mode: "naive" | "abort"): Outcome {
  const inFlight = new Map<number, string>();
  let shown: Outcome["shown"] = null;
  const aborted: number[] = [];
  const applied: number[] = [];

  for (const event of events) {
    if (event.type === "request") {
      if (mode === "abort") {
        // The effect cleanup for the previous query calls controller.abort().
        for (const id of inFlight.keys()) aborted.push(id);
        inFlight.clear();
      }
      inFlight.set(event.id, event.query);
      continue;
    }

    const query = inFlight.get(event.id);
    if (query === undefined) continue; // aborted, unknown, or already handled
    inFlight.delete(event.id);
    shown = { query, results: event.results };
    applied.push(event.id);
  }

  return { shown, aborted, applied };
}
