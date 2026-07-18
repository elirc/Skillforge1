type Status = "idle" | "loading" | "success" | "error";

export function statusBadgeLabel(status: Status): string {
  const labels: Record<Status, string> = { idle: "Ready", loading: "Loading...", success: "Done", error: "Needs attention" };
  return labels[status];
}
