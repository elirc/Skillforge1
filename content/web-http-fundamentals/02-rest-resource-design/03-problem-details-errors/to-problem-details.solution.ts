type AppError =
  | { kind: "not-found"; resource: string; id: string }
  | { kind: "validation"; errors: Record<string, string[]> }
  | { kind: "conflict"; detail: string }
  | { kind: "unexpected"; message: string; stack: string };

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance: string;
  errors?: Record<string, string[]>;
}

const BASE = "https://example.com/problems/";

export function toProblemDetails(error: AppError, instance: string): ProblemDetails {
  switch (error.kind) {
    case "not-found":
      return {
        type: `${BASE}not-found`,
        title: "Resource not found",
        status: 404,
        detail: `${error.resource} ${error.id} was not found.`,
        instance,
      };
    case "validation":
      return {
        type: `${BASE}validation`,
        title: "One or more validation errors occurred.",
        status: 400,
        instance,
        errors: error.errors,
      };
    case "conflict":
      return { type: `${BASE}conflict`, title: "Conflict", status: 409, detail: error.detail, instance };
    default:
      return { type: "about:blank", title: "An unexpected error occurred.", status: 500, instance };
  }
}
