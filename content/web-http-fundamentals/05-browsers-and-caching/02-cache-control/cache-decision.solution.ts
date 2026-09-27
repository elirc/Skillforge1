type Decision = "do-not-store" | "revalidate" | "fresh";

export function cacheDecision(cacheControl: string, ageSeconds: number, sharedCache: boolean): Decision {
  const directives = new Map<string, string>();
  for (const part of cacheControl.split(",")) {
    const trimmed = part.trim();
    if (trimmed === "") continue;
    const eq = trimmed.indexOf("=");
    const name = (eq === -1 ? trimmed : trimmed.slice(0, eq)).trim().toLowerCase();
    const value = eq === -1 ? "" : trimmed.slice(eq + 1).trim().replace(/^"(.*)"$/, "$1");
    directives.set(name, value);
  }

  if (directives.has("no-store")) return "do-not-store";
  if (sharedCache && directives.has("private")) return "do-not-store";
  if (directives.has("no-cache")) return "revalidate";

  const raw = sharedCache && directives.has("s-maxage") ? directives.get("s-maxage") : directives.get("max-age");
  if (raw === undefined) return "revalidate";
  return ageSeconds < Number(raw) ? "fresh" : "revalidate";
}
