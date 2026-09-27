"use client";
import { useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => { window.addEventListener("skillforge-theme", callback); return () => window.removeEventListener("skillforge-theme", callback); };
const snapshot = () => { try { return localStorage.getItem("skillforge:theme") ?? "system"; } catch { return "system"; } };
export function ThemePicker() {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "system");
  return <label className="flex items-center gap-2 text-sm">Appearance<select aria-label="Color theme" className="rounded border bg-transparent p-2" value={theme} onChange={event => {
    const value = event.target.value;
    try { localStorage.setItem("skillforge:theme", value); } catch {}
    document.documentElement.dataset.theme = value;
    window.dispatchEvent(new Event("skillforge-theme"));
  }}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>;
}
