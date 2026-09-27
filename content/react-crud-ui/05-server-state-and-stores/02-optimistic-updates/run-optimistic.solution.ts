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
  | { type: "mutate"; id: string; change: Change }
  | { type: "settle"; id: string; ok: boolean };

function applyChange(todos: Todo[], change: Change): Todo[] {
  switch (change.op) {
    case "toggle":
      return todos.map((t) => (t.id === change.todoId ? { ...t, done: !t.done } : t));
    case "rename":
      return todos.map((t) => (t.id === change.todoId ? { ...t, title: change.title } : t));
    case "delete":
      return todos.filter((t) => t.id !== change.todoId);
  }
}

export function runOptimistic(
  serverTodos: Todo[],
  events: MutationEvent[],
): { cache: Todo[]; server: Todo[]; refetches: number } {
  let server = serverTodos;
  let cache = serverTodos;
  let refetches = 0;
  const pending = new Map<string, { snapshot: Todo[]; change: Change }>();

  for (const event of events) {
    if (event.type === "mutate") {
      // onMutate: snapshot the cache, then write the optimistic result.
      pending.set(event.id, { snapshot: cache, change: event.change });
      cache = applyChange(cache, event.change);
      continue;
    }

    const mutation = pending.get(event.id);
    if (!mutation) continue;
    pending.delete(event.id);

    if (event.ok) server = applyChange(server, mutation.change);
    else cache = mutation.snapshot; // onError: roll back to the snapshot

    // onSettled: invalidate, but only once the last in-flight mutation settles.
    if (pending.size === 0) {
      cache = server;
      refetches += 1;
    }
  }

  return { cache, server, refetches };
}
