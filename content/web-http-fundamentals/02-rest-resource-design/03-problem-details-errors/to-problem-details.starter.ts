type AppError =
  | { kind: "not-found"; resource: string; id: string }
  | { kind: "validation"; errors: Record<string, string[]> }
  | { kind: "conflict"; detail: string }
  | { kind: "unexpected"; message: string; stack: string };

// Turn an application error into an RFC 9457 "problem details" body
// (Content-Type: application/problem+json). `instance` is the request path.
//
// Key order: type, title, status, detail (only when listed), instance, errors (only for validation).
//
// not-found  -> type "https://example.com/problems/not-found", title "Resource not found",
//               status 404, detail "<resource> <id> was not found."
// validation -> type "https://example.com/problems/validation",
//               title "One or more validation errors occurred.", status 400, errors
// conflict   -> type "https://example.com/problems/conflict", title "Conflict",
//               status 409, detail (from the error)
// unexpected -> type "about:blank", title "An unexpected error occurred.", status 500.
//               NO detail: never send exception messages or stack traces to clients.
export function toProblemDetails(error: AppError, instance: string) {
}
