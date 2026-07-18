type Status = "draft" | "published" | "archived";

export function userIsDraft(status: Status): boolean {
  return status === "draft";
}
