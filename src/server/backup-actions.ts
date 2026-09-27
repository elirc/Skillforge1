"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dayKey } from "@/lib/gamification";
import { parseBackup } from "@/lib/backup";
import { exportProgress, importProgress, type ImportReport } from "@/server/backup";
import { getCurrentUser } from "@/server/user";

/** Matches `serverActions.bodySizeLimit` in next.config.ts, with headroom for the envelope. */
const MAX_BACKUP_CHARS = 20 * 1024 * 1024;

export async function exportProgressAction(): Promise<{ fileName: string; json: string }> {
  const user = await getCurrentUser();
  const now = new Date();
  const backup = await exportProgress(user.id, { now });
  return {
    fileName: `skillforge-progress-${dayKey(now)}.json`,
    json: JSON.stringify(backup, null, 2),
  };
}

export type ImportProgressResult = { ok: true; report: ImportReport } | { ok: false; error: string };

export async function importProgressAction(text: string): Promise<ImportProgressResult> {
  const input = z.string().max(MAX_BACKUP_CHARS, "That file is too large to be a Skillforge backup.").safeParse(text);
  if (!input.success) return { ok: false, error: input.error.issues[0]?.message ?? "Invalid file." };

  let raw: unknown;
  try {
    raw = JSON.parse(input.data);
  } catch {
    return { ok: false, error: "That file is not valid JSON." };
  }

  const parsed = parseBackup(raw);
  if (!parsed.ok) return parsed;

  const user = await getCurrentUser();
  try {
    const report = await importProgress(user.id, parsed.backup);
    for (const path of ["/", "/tracks", "/reviews", "/profile", "/mastery", "/problems"]) revalidatePath(path);
    return { ok: true, report };
  } catch (error) {
    console.error("Progress import failed", error);
    return { ok: false, error: "Import failed and nothing was changed. Your previous progress is intact." };
  }
}
