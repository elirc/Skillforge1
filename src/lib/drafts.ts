export interface EditorDraft { code: string; version: string; assisted: boolean; savedAt: string; }
export function draftVersion(starter: string, tests: unknown): string {
  let hash = 2166136261;
  for (const char of starter + JSON.stringify(tests)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16);
}
export function readDraft(id: string): EditorDraft | null {
  try {
    const value = JSON.parse(localStorage.getItem(`skillforge:draft:${id}`) ?? "null");
    return value && typeof value.code === "string" && typeof value.version === "string" ? value : null;
  } catch { return null; }
}
export function saveDraft(id: string, draft: EditorDraft): boolean {
  try { localStorage.setItem(`skillforge:draft:${id}`, JSON.stringify(draft)); return true; } catch { return false; }
}
export function downloadDraft(filename: string, code: string) {
  const url = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
