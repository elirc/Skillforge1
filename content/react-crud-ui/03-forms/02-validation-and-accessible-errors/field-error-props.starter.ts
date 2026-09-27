interface ProductValues {
  name: string;
  price: string;
  sku: string;
}

type Field = keyof ProductValues;

// Validation rules (check trimmed values; one message per field, first broken rule wins):
// name:  "" -> "Name is required"; longer than 60 -> "Name must be 60 characters or fewer"
// price: "" -> "Price is required"; not digits with an optional .d or .dd ->
//        "Price must be a number with up to 2 decimals"
// sku:   optional; when filled it must match ABC-1234 (3 capitals, dash, 4 digits) ->
//        "SKU must look like ABC-1234"
//
// Then compute the props each field needs to render accessibly:
//   <input id={id} aria-invalid={invalid} aria-describedby={describedBy ?? undefined} />
//   {message && <p id={`${id}-error`}>{message}</p>}
// An error is SHOWN only once the field is touched or the form was submitted.
// For each field, in the order name, price, sku, return { id, invalid, describedBy, message }:
//   id: "product-<field>"; message: the visible error or null; invalid: message !== null;
//   describedBy: "product-<field>-error" when a message is shown, else null.
// canSubmit is true only when there are no errors at all, visible or not.
// Return { fields, canSubmit }.
export function fieldErrorProps(values: ProductValues, touched: Field[], submitted: boolean) {
  const fields: Record<string, unknown> = {};
  for (const field of ["name", "price", "sku"]) {
    fields[field] = { id: field, invalid: false, describedBy: null, message: null };
  }
  return { fields, canSubmit: true };
}
