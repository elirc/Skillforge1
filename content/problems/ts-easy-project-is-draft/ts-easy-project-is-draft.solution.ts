type Status = "draft" | "published" | "archived";

export function projectIsDraft(status: Status): boolean {
  return status === "draft";
}
