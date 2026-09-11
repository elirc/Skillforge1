/** Small SVG progress ring used for level progress and the daily XP goal. */
export function XpRing({
  value,
  max,
  size = 56,
  stroke = 6,
  label,
  sublabel,
  tone = "emerald",
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  tone?: "emerald" | "amber";
}) {
  const pct = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = tone === "amber" ? "stroke-amber-500" : "stroke-emerald-500";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${Math.round(pct * 100)}% complete`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          className={color}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
        />
      </svg>
      <span className="absolute flex flex-col items-center leading-none">
        {label ? <span className="text-sm font-semibold">{label}</span> : null}
        {sublabel ? <span className="text-[10px] text-slate-500">{sublabel}</span> : null}
      </span>
    </div>
  );
}
