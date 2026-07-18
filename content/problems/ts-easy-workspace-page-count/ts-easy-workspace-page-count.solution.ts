export function workspacePageCount(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}
