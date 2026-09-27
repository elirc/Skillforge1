"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exportProgressAction, importProgressAction } from "@/server/backup-actions";

type Staged = { name: string; text: string };

export function ProgressBackup() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [staged, setStaged] = useState<Staged | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  useEffect(() => { try { const previous = localStorage.getItem("skillforge:last-backup"); if (previous) { const timer = setTimeout(() => setLastBackup(previous), 0); return () => clearTimeout(timer); } } catch {} }, []);

  function download() {
    setMessage(null);
    startTransition(async () => {
      try {
        const { fileName, json } = await exportProgressAction();
        const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setMessage({ tone: "ok", text: `Saved ${fileName}.` });
        const timestamp = new Date().toISOString();
        setLastBackup(timestamp);
        try { localStorage.setItem("skillforge:last-backup", timestamp); } catch {}
      } catch {
        setMessage({ tone: "error", text: "Export failed. Nothing was changed." });
      }
    });
  }

  async function stage(event: React.ChangeEvent<HTMLInputElement>) {
    setMessage(null);
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setStaged({ name: file.name, text: await file.text() });
    } catch {
      setMessage({ tone: "error", text: "Could not read that file." });
    }
  }

  function confirmImport() {
    if (!staged) return;
    const { text } = staged;
    startTransition(async () => {
      const result = await importProgressAction(text);
      setStaged(null);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      const { imported, skippedTotal, level, xp } = result.report;
      const skippedNote =
        skippedTotal === 0
          ? "Every entry matched current content."
          : `${skippedTotal} ${skippedTotal === 1 ? "entry was" : "entries were"} skipped because that content no longer exists.`;
      setMessage({
        tone: "ok",
        text: `Restored level ${level} (${xp.toLocaleString()} XP), ${imported.lessonCompletions} lessons, ${imported.reviewStates} review cards and ${imported.problemSubmissions} submissions. ${skippedNote}`,
      });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup</CardTitle>
        <CardDescription>
          Your progress lives in one SQLite file. New exports use stable content IDs so progress can follow lessons after reordering.
          This installation keeps its pre-upgrade positions for older exports; backups from a different old curriculum should be restored against that curriculum first. Editor drafts stay in this browser; export them from each exercise to keep a separate copy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">{lastBackup ? `Last download requested in this browser: ${new Date(lastBackup).toLocaleString()}. Keep the downloaded file somewhere safe.` : "No progress download recorded in this browser."}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={download} disabled={isPending}>
            <Download className="h-4 w-4" />
            Download progress
          </Button>
          <Button variant="outline" onClick={() => fileInput.current?.click()} disabled={isPending}>
            <Upload className="h-4 w-4" />
            Import from file…
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={stage}
            aria-label="Choose a progress backup file"
          />
        </div>

        {staged ? (
          <div role="alertdialog" aria-labelledby="import-confirm-title" className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <p id="import-confirm-title" className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Replace your current progress with {staged.name}?
            </p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
              This replaces, it does not merge: your current XP, streak, reviews, completions, submissions, quests and
              achievements are deleted and the file&apos;s are loaded instead. Download a backup first if you might want
              them back.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="destructive" onClick={confirmImport} disabled={isPending}>
                {isPending ? "Importing…" : "Yes, replace my progress"}
              </Button>
              <Button variant="secondary" onClick={() => setStaged(null)} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {message ? (
          <p role="status" className={message.tone === "ok" ? "text-sm text-slate-600 dark:text-slate-400" : "text-sm text-rose-600"}>
            {message.text}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
