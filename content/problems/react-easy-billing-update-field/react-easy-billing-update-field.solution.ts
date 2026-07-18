export function billingUpdateField(form: Record<string, string>, field: string, value: string): Record<string, string> {
  return { ...form, [field]: value };
}
