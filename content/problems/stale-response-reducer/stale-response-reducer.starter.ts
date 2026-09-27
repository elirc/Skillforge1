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

export function replayRequests(actions: Action[]) {
  // Track the latest requestId per key and ignore responses from any other request.
}
