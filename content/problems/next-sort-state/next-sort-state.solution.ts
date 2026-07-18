type SortState = "none" | "asc" | "desc";

export function nextSortState(current: SortState): SortState {
  if (current === "none") return "asc";
  if (current === "asc") return "desc";
  return "none";
}
