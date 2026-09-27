type FetchEvent =
  | { type: "request"; id: number; query: string } // the effect starts fetch #id for query
  | { type: "response"; id: number; results: string[] }; // fetch #id resolves

// A search box fetches in useEffect(..., [query]). Responses can arrive out of order.
// Return { shown, aborted, applied }:
// - shown: { query, results } from the last response that was APPLIED, or null
// - aborted: ids of requests that were aborted, in the order they were aborted
// - applied: ids whose response was applied, in order
// mode "naive": every response that belongs to a request we started is applied
//   (so a slow old response can overwrite a newer one).
// mode "abort": starting a request aborts every request still in flight (the
//   effect cleanup calls controller.abort()); responses for aborted requests are ignored.
// In both modes a response for an unknown or already-answered id is ignored.
export function resolveFetches(events: FetchEvent[], mode: "naive" | "abort") {
  let shown: { query: string; results: string[] } | null = null;
  const queries = new Map<number, string>();
  for (const event of events) {
    if (event.type === "request") queries.set(event.id, event.query);
    else shown = { query: queries.get(event.id) ?? "", results: event.results };
  }
  return { shown, aborted: [], applied: [] };
}
