export type Migration = { id: string; dependsOn: string[] };
export type RunPlan = { ok: true; order: string[] } | { ok: false; blocked: string[] };

export function planMigrations(migrations: Migration[]) {
  // 1. Ignore dependencies on ids that are not in the list (already applied).
  // 2. Count unmet dependencies per migration; the ones at zero are ready.
  // 3. Repeatedly run the alphabetically smallest ready migration.
  // 4. Anything never run is blocked.
}
