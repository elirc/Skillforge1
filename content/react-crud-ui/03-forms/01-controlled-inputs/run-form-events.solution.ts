type FormEvent =
  | { type: "change"; field: string; value: string }
  | { type: "blur"; field: string }
  | { type: "reset" };

interface FormSnapshot {
  values: Record<string, string>;
  touched: string[];
  dirty: string[];
  isDirty: boolean;
}

export function runFormEvents(initial: Record<string, string>, events: FormEvent[]): FormSnapshot {
  const known = (field: string) => Object.prototype.hasOwnProperty.call(initial, field);
  let values = { ...initial };
  let touched: string[] = [];

  for (const event of events) {
    if (event.type === "change") {
      if (known(event.field)) values = { ...values, [event.field]: event.value };
    } else if (event.type === "blur") {
      if (known(event.field) && !touched.includes(event.field)) touched = [...touched, event.field];
    } else {
      values = { ...initial };
      touched = [];
    }
  }

  // Dirty is derived from values vs. initial, never stored separately.
  const dirty = Object.keys(initial).filter((field) => values[field] !== initial[field]);
  return { values, touched, dirty, isDirty: dirty.length > 0 };
}
