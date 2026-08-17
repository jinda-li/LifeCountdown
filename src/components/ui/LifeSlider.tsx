import { cn } from "@/lib/cn";

export function LifeSlider({
  value,
  className,
  label,
  compact,
}: {
  value: number;
  className?: string;
  label?: string;
  compact?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("life-slider", compact && "compact", className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Number(pct.toFixed(1))}
    >
      <div className="life-slider-track">
        <div className="life-slider-fill" style={{ width: `${pct}%` }} />
        <span className="life-slider-thumb" style={{ left: `${pct}%` }} />
      </div>
    </div>
  );
}
