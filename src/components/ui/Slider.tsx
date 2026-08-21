import { cn } from "@/lib/cn";

type Props = {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  "aria-label"?: string;
};

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: Props) {
  const span = max - min || 1;
  const clamped = Math.min(max, Math.max(min, value));
  const fill = `${((clamped - min) / span) * 100}%`;

  return (
    <input
      type="range"
      className={cn("theme-slider", className)}
      min={min}
      max={max}
      step={step}
      value={clamped}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={clamped}
      style={{ "--slider-fill": fill } as React.CSSProperties}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
