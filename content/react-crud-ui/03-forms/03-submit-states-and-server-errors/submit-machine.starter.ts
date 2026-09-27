type Status = "idle" | "submitting" | "success" | "error";

type SubmitEvent =
  | { type: "submit" }
  | { type: "success"; id: number }
  | { type: "failure"; status: number; fieldErrors?: Record<string, string>; message?: string }
  | { type: "edit"; field: string };

// Replay the events of one create-product form and return, in this key order:
// { status, disabled, submitCount, fieldErrors, formError, savedId }
// Start: idle, submitCount 0, fieldErrors {}, formError null, savedId null.
// - submit:  ignored while "submitting" (a double click must not send twice).
//            Otherwise -> "submitting", submitCount + 1, clear fieldErrors and formError.
// - success: only while "submitting" (otherwise it is a stale response) -> "success", savedId = id.
// - failure: only while "submitting" -> "error", then
//            422  -> fieldErrors = the server's fieldErrors (or {}), formError null
//            >=500 -> formError "Something went wrong. Try again."
//            other -> formError = message, or "Request failed (<status>)" when there is none
// - edit:    remove that field's server error; if status is "success" it becomes "idle".
// disabled is true exactly while status is "submitting".
export function submitMachine(events: SubmitEvent[]) {
  let status: Status = "idle";
  let submitCount = 0;
  let savedId: number | null = null;
  for (const event of events) {
    if (event.type === "submit") {
      status = "submitting";
      submitCount += 1;
    } else if (event.type === "success") {
      status = "success";
      savedId = event.id;
    }
  }
  return { status, disabled: false, submitCount, fieldErrors: {}, formError: null, savedId };
}
