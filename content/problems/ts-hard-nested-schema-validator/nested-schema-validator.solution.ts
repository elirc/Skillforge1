type Schema =
  | { type: "string"; minLength?: number; maxLength?: number; enum?: string[] }
  | { type: "number"; min?: number; max?: number; integer?: boolean }
  | { type: "boolean" }
  | { type: "array"; items: Schema; minItems?: number }
  | { type: "object"; properties: Record<string, Schema>; required?: string[]; additionalProperties?: boolean };

type Errors = Record<string, string>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function check(schema: Schema, value: unknown, path: string, errors: Errors): void {
  switch (schema.type) {
    case "string": {
      if (typeof value !== "string") {
        errors[path] = "expected string";
      } else if (schema.minLength !== undefined && value.length < schema.minLength) {
        errors[path] = `must be at least ${schema.minLength} characters`;
      } else if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        errors[path] = `must be at most ${schema.maxLength} characters`;
      } else if (schema.enum !== undefined && !schema.enum.includes(value)) {
        errors[path] = `must be one of: ${schema.enum.join(", ")}`;
      }
      return;
    }
    case "number": {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        errors[path] = "expected number";
      } else if (schema.integer && !Number.isInteger(value)) {
        errors[path] = "expected integer";
      } else if (schema.min !== undefined && value < schema.min) {
        errors[path] = `must be >= ${schema.min}`;
      } else if (schema.max !== undefined && value > schema.max) {
        errors[path] = `must be <= ${schema.max}`;
      }
      return;
    }
    case "boolean": {
      if (typeof value !== "boolean") errors[path] = "expected boolean";
      return;
    }
    case "array": {
      if (!Array.isArray(value)) {
        errors[path] = "expected array";
        return;
      }
      if (schema.minItems !== undefined && value.length < schema.minItems) {
        errors[path] = `must have at least ${schema.minItems} items`;
      }
      value.forEach((item, index) => check(schema.items, item, `${path}[${index}]`, errors));
      return;
    }
    case "object": {
      if (!isPlainObject(value)) {
        errors[path] = "expected object";
        return;
      }
      const required = new Set(schema.required ?? []);
      for (const [key, child] of Object.entries(schema.properties)) {
        const childPath = `${path}.${key}`;
        if (!Object.prototype.hasOwnProperty.call(value, key) || value[key] === undefined) {
          if (required.has(key)) errors[childPath] = "is required";
          continue;
        }
        check(child, value[key], childPath, errors);
      }
      if (schema.additionalProperties === false) {
        for (const key of Object.keys(value)) {
          if (!Object.prototype.hasOwnProperty.call(schema.properties, key)) errors[`${path}.${key}`] = "is not allowed";
        }
      }
      return;
    }
  }
}

export function validate(schema: Schema, value: unknown): Errors {
  const errors: Errors = {};
  check(schema, value, "$", errors);
  return errors;
}
