interface Outcome {
  operation: "create" | "read" | "list" | "update" | "delete";
  result: "ok" | "invalid" | "unauthenticated" | "forbidden" | "not-found" | "conflict" | "precondition-failed";
  // Only meaningful for a successful update: does the response carry the updated resource?
  returnsBody?: boolean;
}

// Pick the HTTP status code for the outcome of a CRUD endpoint.
//
// Failures (same for every operation):
//   invalid -> 400, unauthenticated -> 401, forbidden -> 403, not-found -> 404,
//   conflict -> 409, precondition-failed -> 412
// Success ("ok"):
//   create -> 201, read -> 200, list -> 200, delete -> 204,
//   update -> 200 when returnsBody is true, otherwise 204
export function pickStatus(outcome: Outcome) {
}
