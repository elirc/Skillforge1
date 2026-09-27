export type Migration = { id: string; dependsOn: string[] };
export type RunPlan = { ok: true; order: string[] } | { ok: false; blocked: string[] };

export function planMigrations(migrations: Migration[]): RunPlan {
  const known = new Set(migrations.map((migration) => migration.id));
  const unmet = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const migration of migrations) {
    // A Set so a dependency listed twice is only counted once.
    const deps = new Set(migration.dependsOn.filter((dep) => known.has(dep)));
    unmet.set(migration.id, deps.size);
    for (const dep of deps) {
      const list = dependents.get(dep) ?? [];
      list.push(migration.id);
      dependents.set(dep, list);
    }
  }

  const ready = migrations.filter((migration) => unmet.get(migration.id) === 0).map((migration) => migration.id);
  const order: string[] = [];

  while (ready.length > 0) {
    ready.sort();
    const id = ready.shift()!;
    order.push(id);
    for (const next of dependents.get(id) ?? []) {
      const left = unmet.get(next)! - 1;
      unmet.set(next, left);
      if (left === 0) ready.push(next);
    }
  }

  if (order.length === migrations.length) return { ok: true, order };

  const ran = new Set(order);
  return {
    ok: false,
    blocked: migrations.map((migration) => migration.id).filter((id) => !ran.has(id)).sort(),
  };
}
