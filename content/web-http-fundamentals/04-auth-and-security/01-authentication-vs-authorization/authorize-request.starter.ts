interface User {
  id: number;
  roles: string[];
}

interface Note {
  ownerId: number;
  visibility: "public" | "private";
}

// Decide the status code for an action on a note. Check in this order:
//
// 1. Anyone, even signed out, may "read" a public note -> 200.
// 2. No user (null) -> 401: we do not know who you are (authentication failed).
// 3. A user with the "admin" role may do anything -> 200.
// 4. The note's owner may do anything with it -> 200.
// 5. Someone else's PRIVATE note -> 404: do not reveal that it exists.
// 6. Someone else's public note, action "update" or "delete" -> 403:
//    we know who you are, and you are not allowed (authorization failed).
export function authorizeRequest(user: User | null, action: "read" | "update" | "delete", note: Note) {
}
