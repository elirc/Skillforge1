"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { previewContentAction, applyContentAction } from "@/server/content-actions";

export function ContentUpdates() {
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewContentAction>> | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  return <section className="space-y-3 rounded-lg border p-5"><h2 className="font-semibold">Course content updates</h2><p className="text-sm text-slate-500">Preview the lessons available in this installation. Applying an update creates a database backup and keeps completion and review history.</p>
    <Button variant="secondary" disabled={pending} onClick={() => startTransition(async () => { try { setPreview(await previewContentAction()); setMessage(""); } catch { setMessage("Could not load the authored catalog. Check its validation output and retry."); } })}>{pending ? "Working…" : "Check for updates"}</Button>
    {preview ? <div className="space-y-3 text-sm"><p>{preview.courses} courses · {preview.lessons} lessons · {preview.problems} problems</p><p>Installed {preview.installedVersion} · Available {preview.version}</p><p>{preview.addedLessons} added lessons · {preview.retiredLessons} retired lessons. Retired content keeps its learning history.</p>{preview.changed ? <Button disabled={pending} onClick={() => startTransition(async () => { try { await applyContentAction(preview.version); setMessage("Content updated. Your progress has been preserved."); setPreview(null); } catch (error) { setMessage(error instanceof Error ? error.message : "Update failed. Try again."); } })}>Back up and apply update</Button> : <p>Content is up to date.</p>}</div> : null}
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </section>;
}
