interface HeatmapDay {
  day: string;
  xp: number;
}

/** GitHub-style contribution grid over the XP ledger. Columns are weeks, rows are weekdays. */
export function ActivityHeatmap({ history }: { history: HeatmapDay[] }) {
  const weeks: HeatmapDay[][] = [];
  for (let index = 0; index < history.length; index += 7) {
    weeks.push(history.slice(index, index + 7));
  }

  const activeDays = history.filter((entry) => entry.xp > 0).length;
  const totalXp = history.reduce((sum, entry) => sum + entry.xp, 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((entry) => (
                <div
                  key={entry.day}
                  title={`${entry.day}: ${entry.xp} XP`}
                  className={`h-3 w-3 rounded-sm ${intensityClass(entry.xp)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {activeDays} active {activeDays === 1 ? "day" : "days"} · {totalXp.toLocaleString()} XP in the last{" "}
        {history.length} days
      </p>
    </div>
  );
}

function intensityClass(xp: number) {
  if (xp === 0) return "bg-slate-100 dark:bg-slate-800";
  if (xp < 25) return "bg-emerald-200 dark:bg-emerald-900";
  if (xp < 60) return "bg-emerald-300 dark:bg-emerald-800";
  if (xp < 120) return "bg-emerald-500 dark:bg-emerald-600";
  return "bg-emerald-600 dark:bg-emerald-400";
}
