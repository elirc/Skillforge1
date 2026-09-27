export type Action =
  | { type: "request"; key: string; requestId: string }
  | { type: "success"; key: string; requestId: string; data: unknown }
  | { type: "failure"; key: string; requestId: string; error: string }
  | { type: "cancel"; key: string };

export type Entry = {
  status: "idle" | "loading" | "success" | "error";
  data: unknown;
  error: string | null;
  requestId: string | null;
};

export function replayRequests(actions: Action[]): { state: Record<string, Entry>; ignored: number } {
  const state: Record<string, Entry> = {};
  let ignored = 0;

  for (const action of actions) {
    const current = state[action.key];

    switch (action.type) {
      case "request": {
        const base = current ?? { status: "idle", data: null, error: null, requestId: null };
        state[action.key] = { status: "loading", data: base.data, error: null, requestId: action.requestId };
        break;
      }
      case "success":
      case "failure": {
        if (!current || current.status !== "loading" || current.requestId !== action.requestId) {
          ignored++;
          break;
        }
        state[action.key] =
          action.type === "success"
            ? { status: "success", data: action.data, error: null, requestId: current.requestId }
            : { status: "error", data: current.data, error: action.error, requestId: current.requestId };
        break;
      }
      case "cancel": {
        if (!current || current.status !== "loading") break;
        state[action.key] = {
          status: current.data !== null ? "success" : "idle",
          data: current.data,
          error: null,
          requestId: null,
        };
        break;
      }
    }
  }

  return { state, ignored };
}
