type Role = "admin" | "editor" | "viewer";

export function describeRole(role: Role): string {
  const labels: Record<Role, string> = { admin: "Administrator", editor: "Editor", viewer: "Viewer" };
  return labels[role];
}
