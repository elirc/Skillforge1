interface User {
  id: string;
  name: string;
  age: number;
}

// A type guard returns a boolean at runtime, and its `value is User` return
// type tells the compiler what a true result proves.
function isUser(value: unknown): value is User {
  // TODO: return true only when value is a non-null, non-array object with
  //   - id: a non-empty string
  //   - name: a string
  //   - age: a whole number that is 0 or more
  return false;
}

// Because isUser is a type guard, filter(isUser) returns User[], not unknown[].
export function filterUsers(values: unknown[]): User[] {
  return values.filter(isUser);
}
