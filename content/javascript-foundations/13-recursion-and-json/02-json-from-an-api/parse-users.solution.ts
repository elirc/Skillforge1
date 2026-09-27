// The API sends text like:
// {"data":{"users":[{"id":1,"email":"ada@example.com","profile":{"name":"Ada"}}]}}
// Return [{ id, name, email }] with safe defaults for missing pieces.
export function parseUsers(json: string) {
  let body;
  try {
    body = JSON.parse(json);
  } catch {
    return []; // not valid JSON at all
  }

  const users = body?.data?.users;
  if (!Array.isArray(users)) return [];

  const result: { id: number; name: string; email: string | null }[] = [];
  for (const user of users) {
    if (typeof user?.id !== "number") continue; // a user without an id is useless
    result.push({
      id: user.id,
      name: typeof user.profile?.name === "string" ? user.profile.name : "Unknown",
      email: typeof user.email === "string" ? user.email : null,
    });
  }
  return result;
}
