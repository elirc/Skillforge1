interface ProductValues {
  name: string;
  price: string;
  sku: string;
}

type Field = keyof ProductValues;

interface FieldProps {
  id: string;
  invalid: boolean;
  describedBy: string | null;
  message: string | null;
}

function validate(values: ProductValues): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};

  const name = values.name.trim();
  if (name === "") errors.name = "Name is required";
  else if (name.length > 60) errors.name = "Name must be 60 characters or fewer";

  const price = values.price.trim();
  if (price === "") errors.price = "Price is required";
  else if (!/^\d+(\.\d{1,2})?$/.test(price)) errors.price = "Price must be a number with up to 2 decimals";

  const sku = values.sku.trim();
  if (sku !== "" && !/^[A-Z]{3}-\d{4}$/.test(sku)) errors.sku = "SKU must look like ABC-1234";

  return errors;
}

export function fieldErrorProps(
  values: ProductValues,
  touched: Field[],
  submitted: boolean,
): { fields: Record<Field, FieldProps>; canSubmit: boolean } {
  const errors = validate(values);
  const order: Field[] = ["name", "price", "sku"];
  const fields = {} as Record<Field, FieldProps>;

  for (const field of order) {
    const visible = submitted || touched.includes(field);
    const message = visible ? (errors[field] ?? null) : null;
    fields[field] = {
      id: `product-${field}`,
      invalid: message !== null,
      describedBy: message !== null ? `product-${field}-error` : null,
      message,
    };
  }

  return { fields, canSubmit: Object.keys(errors).length === 0 };
}
