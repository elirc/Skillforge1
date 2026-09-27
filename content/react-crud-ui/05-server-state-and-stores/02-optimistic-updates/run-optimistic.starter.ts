interface Todo {
  id: number;
  title: string;
  done: boolean;
}

type Change =
  | { op: "toggle"; todoId: number }
  | { op: "rename"; todoId: number; title: string }
  | { op: "delete"; todoId: number };

type MutationEvent =
  | { type: "mutate"; id: string; change: Change } // mutate() is called
  | { type: "settle"; id: string; ok: boolean }; // the request for mutation `id` finishes

// Model a TanStack Query optimistic update on the ["todos"] cache.
// Start with cache = server = serverTodos. Track `refetches`.
// - mutate (onMutate): remember a snapshot of the CURRENT cache for this mutation,
//   then apply the change to the cache immediately (never mutate arrays in place).
// - settle for an unknown or already-settled id: ignore.
// - settle ok: the server applies the change.
// - settle failed (onError): the cache goes back to this mutation's snapshot.
// - then (onSettled): if no other mutation is still pending, invalidate: the
//   cache becomes the server's list and refetches += 1. If others are pending,
//   skip it, so a refetch does not overwrite their optimistic changes.
// Return { cache, server, refetches }.
export function runOptimistic(serverTodos: Todo[], events: MutationEvent[]) {
  let cache = serverTodos;
  for (const event of events) {
    if (event.type !== "mutate") continue;
    const change = event.change;
    if (change.op === "delete") cache = cache.filter((t) => t.id !== change.todoId);
    else if (change.op === "toggle") cache = cache.map((t) => (t.id === change.todoId ? { ...t, done: !t.done } : t));
    else cache = cache.map((t) => (t.id === change.todoId ? { ...t, title: change.title } : t));
  }
  return { cache, server: serverTodos, refetches: 0 };
}
