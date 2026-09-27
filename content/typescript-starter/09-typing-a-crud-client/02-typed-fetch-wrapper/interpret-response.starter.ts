interface Todo {
  id: number;
  title: string;
  done: boolean;
}

// What fetch gave us, reduced to plain data: the status code and the parsed body.
interface RawResponse {
  status: number;
  body: unknown;
}

// Every outcome a caller must handle, as a discriminated union on kind.
type ApiResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "not-found" }
  | { kind: "unauthorized" }
  | { kind: "invalid"; fieldErrors: Record<string, string> }
  | { kind: "error"; message: string; retryable: boolean };

// The pure core of a typed fetch wrapper: turn a raw response into ApiResult<Todo>.
export function interpretResponse(response: RawResponse) {
  // 200 or 201: body must be a Todo (id number, title string, done boolean).
  //   Return { kind: "ok", data: { id, title, done } } (only those three keys).
  //   A malformed body -> { kind: "error", message: "Malformed response body", retryable: false }.
  // 401 or 403: { kind: "unauthorized" }
  // 404: { kind: "not-found" }
  // 422: { kind: "invalid", fieldErrors: body.errors } when body.errors is an
  //   object whose values are all strings; otherwise fieldErrors is {}.
  // 429 or any 5xx: { kind: "error", message, retryable: true } where message is
  //   body.message when it is a string, else "Server error (<status>)".
  // Anything else: { kind: "error", message: "Unexpected status <status>", retryable: false }.
}
