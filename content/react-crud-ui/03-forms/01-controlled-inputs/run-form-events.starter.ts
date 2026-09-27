type FormEvent =
  | { type: "change"; field: string; value: string } // onChange -> e.target.value (always a string)
  | { type: "blur"; field: string } // onBlur
  | { type: "reset" }; // a "Reset" button

// A controlled form keeps every input's value in state: <input value={values.name} onChange={...} />.
// Replay the events and return { values, touched, dirty, isDirty } (in that key order):
// - change: update that field's value; ignore fields that are not in `initial`
// - blur: mark the field touched (each field once, in the order first blurred; ignore unknown fields)
// - reset: values back to `initial`, touched back to []
// - dirty: fields whose value differs from `initial`, in `initial` key order (derive it at the end)
// - isDirty: dirty.length > 0
export function runFormEvents(initial: Record<string, string>, events: FormEvent[]) {
  const values: Record<string, string> = { ...initial };
  for (const event of events) {
    if (event.type === "change") values[event.field] = event.value;
  }
  return { values, touched: [], dirty: [], isDirty: false };
}
