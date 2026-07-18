type Status = "draft" | "published" | "archived";

export function workspaceIsDraft(status: Status): boolean {
  return status === "draft";
}
