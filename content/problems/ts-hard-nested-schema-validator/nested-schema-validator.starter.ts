type Schema =
  | { type: "string"; minLength?: number; maxLength?: number; enum?: string[] }
  | { type: "number"; min?: number; max?: number; integer?: boolean }
  | { type: "boolean" }
  | { type: "array"; items: Schema; minItems?: number }
  | { type: "object"; properties: Record<string, Schema>; required?: string[]; additionalProperties?: boolean };

export function validate(schema: Schema, value: unknown) {
  // Walk schema and value together, starting at path "$".
  // Object children are "<path>.<key>", array items are "<path>[<index>]".
  // Record at most one message per path (the first rule that fails) and
  // return a Record<path, message>, or {} when the value is valid.
}
