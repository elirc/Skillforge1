interface User {
  id: string;
  name: string;
  age: number;
}

function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    record.id.length > 0 &&
    typeof record.name === "string" &&
    typeof record.age === "number" &&
    Number.isInteger(record.age) &&
    record.age >= 0
  );
}

export function filterUsers(values: unknown[]): User[] {
  return values.filter(isUser);
}
