interface Outcome {
  operation: "create" | "read" | "list" | "update" | "delete";
  result: "ok" | "invalid" | "unauthenticated" | "forbidden" | "not-found" | "conflict" | "precondition-failed";
  returnsBody?: boolean;
}

const FAILURE_STATUS: Record<Exclude<Outcome["result"], "ok">, number> = {
  invalid: 400,
  unauthenticated: 401,
  forbidden: 403,
  "not-found": 404,
  conflict: 409,
  "precondition-failed": 412,
};

export function pickStatus(outcome: Outcome): number {
  if (outcome.result !== "ok") return FAILURE_STATUS[outcome.result];
  switch (outcome.operation) {
    case "create":
      return 201;
    case "delete":
      return 204;
    case "update":
      return outcome.returnsBody ? 200 : 204;
    default:
      return 200;
  }
}
