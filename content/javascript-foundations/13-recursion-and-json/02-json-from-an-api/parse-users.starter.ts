// The API sends text like:
// {"data":{"users":[{"id":1,"email":"ada@example.com","profile":{"name":"Ada"}}]}}
// Return [{ id, name, email }] with safe defaults for missing pieces.
export function parseUsers(json: string) {
  // This crashes on bad JSON and on missing pieces. Add try/catch around JSON.parse,
  // use ?. to reach nested fields, and fall back to "Unknown" / null / [].
  const body = JSON.parse(json);
  return body.data.users.map((user: { id: number; email: string; profile: { name: string } }) => ({
    id: user.id,
    name: user.profile.name,
    email: user.email,
  }));
}
