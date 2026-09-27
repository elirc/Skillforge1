interface Todo {
  id: number;
  title: string;
  done: boolean;
}

interface RawResponse {
  status: number;
  body: unknown;
}

type ApiResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "not-found" }
  | { kind: "unauthorized" }
  | { kind: "invalid"; fieldErrors: Record<string, string> }
  | { kind: "error"; message: string; retryable: boolean };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTodo(value: unknown): value is Todo {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.done === "boolean"
  );
}

function isStringMap(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
}

export function interpretResponse(response: RawResponse): ApiResult<Todo> {
  const { status, body } = response;

  if (status === 200 || status === 201) {
    if (!isTodo(body)) return { kind: "error", message: "Malformed response body", retryable: false };
    return { kind: "ok", data: { id: body.id, title: body.title, done: body.done } };
  }
  if (status === 401 || status === 403) return { kind: "unauthorized" };
  if (status === 404) return { kind: "not-found" };
  if (status === 422) {
    const errors = isRecord(body) ? body.errors : undefined;
    return { kind: "invalid", fieldErrors: isStringMap(errors) ? errors : {} };
  }
  if (status === 429 || (status >= 500 && status <= 599)) {
    const message = isRecord(body) && typeof body.message === "string" ? body.message : `Server error (${status})`;
    return { kind: "error", message, retryable: true };
  }
  return { kind: "error", message: `Unexpected status ${status}`, retryable: false };
}
