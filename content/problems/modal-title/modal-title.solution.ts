type ModalMode = "create" | "edit";

export function modalTitle(mode: ModalMode): string {
  return mode === "create" ? "Create item" : "Edit item";
}
