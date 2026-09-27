interface User {
  id: number;
  roles: string[];
}

interface Note {
  ownerId: number;
  visibility: "public" | "private";
}

export function authorizeRequest(user: User | null, action: "read" | "update" | "delete", note: Note): number {
  if (action === "read" && note.visibility === "public") return 200;
  if (user === null) return 401;
  if (user.roles.includes("admin")) return 200;
  if (user.id === note.ownerId) return 200;
  if (note.visibility === "private") return 404;
  return 403;
}
