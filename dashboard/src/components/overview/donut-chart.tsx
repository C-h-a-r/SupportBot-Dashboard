import { cn } from "@/lib/utils";

interface DonutChartProps {
  percent: number;
  size?: number;
  className?: string;
  trackClassName?: string;
  strokeClassName?: string;
}

export function DonutChart({
  percent,
  size = 128,
  className,
  trackClassName = "stroke-white/20",
  strokeClassName = "stroke-white",
}: DonutChartProps) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = c - (clamped / 100) * c;

  return (
    <div className={cn("relative inline-flex", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          className={trackClassName}
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={strokeClassName}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold tabular-nums leading-none">
          {Math.round(clamped)}%
        </span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide opacity-80">
          Complete
        </span>
      </div>
    </div>
  );
}
