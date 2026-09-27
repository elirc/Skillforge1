type Status = "idle" | "submitting" | "success" | "error";

type SubmitEvent =
  | { type: "submit" }
  | { type: "success"; id: number }
  | { type: "failure"; status: number; fieldErrors?: Record<string, string>; message?: string }
  | { type: "edit"; field: string };

interface SubmitState {
  status: Status;
  disabled: boolean;
  submitCount: number;
  fieldErrors: Record<string, string>;
  formError: string | null;
  savedId: number | null;
}

export function submitMachine(events: SubmitEvent[]): SubmitState {
  let status: Status = "idle";
  let submitCount = 0;
  let fieldErrors: Record<string, string> = {};
  let formError: string | null = null;
  let savedId: number | null = null;

  for (const event of events) {
    switch (event.type) {
      case "submit":
        if (status === "submitting") break; // double click: ignore
        status = "submitting";
        submitCount += 1;
        fieldErrors = {};
        formError = null;
        break;
      case "success":
        if (status !== "submitting") break; // stale response
        status = "success";
        savedId = event.id;
        break;
      case "failure":
        if (status !== "submitting") break;
        status = "error";
        if (event.status === 422) {
          fieldErrors = { ...(event.fieldErrors ?? {}) };
          formError = null;
        } else if (event.status >= 500) {
          formError = "Something went wrong. Try again.";
        } else {
          formError = event.message ?? `Request failed (${event.status})`;
        }
        break;
      case "edit": {
        const rest = { ...fieldErrors };
        delete rest[event.field];
        fieldErrors = rest;
        if (status === "success") status = "idle";
        break;
      }
    }
  }

  return { status, disabled: status === "submitting", submitCount, fieldErrors, formError, savedId };
}
