type Status = "draft" | "published" | "archived";

export function teamIsDraft(status: Status): boolean {
  return status === "draft";
}
