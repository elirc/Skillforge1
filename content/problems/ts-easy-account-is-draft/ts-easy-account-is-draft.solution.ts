type Status = "draft" | "published" | "archived";

export function accountIsDraft(status: Status): boolean {
  return status === "draft";
}
