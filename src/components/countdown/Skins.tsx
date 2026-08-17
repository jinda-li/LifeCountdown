import { cn } from "@/lib/cn";
import { formatInt } from "@/lib/format";
import type { LifeSnapshot } from "@/lib/life";
import type { SkinId } from "@/data/rewards";
import { NumberTicker } from "@/components/ui/NumberTicker";

function HoursBlock({ life, live }: { life: LifeSnapshot; live?: boolean }) {
  return (
    <div className="text-center">
      <div className="font-display text-[52px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
        {live ? formatInt(life.remainingHours) : <NumberTicker value={life.remainingHours} />}
      </div>
      <div className="mt-2 text-[13px] tracking-[0.18em] text-[var(--secondary)]">小时        小时
      </div>
      <div className="mt-4 flex items-baseline justify-center gap-3 font-display text-[28px] tabular-nums tracking-tight">
        <span>
          {String(life.remainingMinutes).padStart(2, "0")}
          <span className="ml-1 text-[12px] tracking-[0.16em] text-[var(--secondary)]">分</span>
        </span>
        <span className="text-[var(--line-strong)]">:</span>
        <span>
          {String(life.remainingSeconds).padStart(2, "0")}
          <span className="ml-1 text-[12px] tracking-[0.16em] text-[var(--secondary)]">秒</span>
        </span>
      </div>
    </div>
  );
}

function Digits({ life }: { life: LifeSnapshot }) {
  return (
    <div className="px-2 py-4">
      <HoursBlock life={life} live />
      <p className="mt-5 text-center text-[13px] leading-relaxed text-[var(--secondary)]">
        约 {formatInt(life.remainingWeeks)} 周 · {life.remainingYears.toFixed(1)} 年
      </p>
    </div>
  );
}

function Progress({ life }: { life: LifeSnapshot }) {
  const pct = Math.min(100, Math.max(0, life.livedRatio * 100));
  return (
    <div className="px-1 py-2">
      <HoursBlock life={life} live />
      <div className="mt-6">
        <div className="mb-2 flex justify-between text-[11px] tracking-[0.12em] text-[var(--secondary)]">
          <span>已走过 {pct.toFixed(1)}%</span>
          <span>还剩 {(100 - pct).toFixed(1)}%</span>
        </div>
        <div className="h-[10px] overflow-hidden rounded-full bg-[var(--fill)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-[var(--tertiary)]">
          <span>出生</span>
          <span>此刻</span>
          <span>预期</span>
        </div>
      </div>
    </div>
  );
}

function Battery({ life }: { life: LifeSnapshot }) {
  const remain = Math.min(100, Math.max(0, (1 - life.livedRatio) * 100));
  const fill = remain;
  const color =
    fill > 45 ? "var(--ok)" : fill > 20 ? "var(--gold)" : "var(--danger)";
  return (
    <div className="flex flex-col items-center py-2">
      <div className="flex items-center gap-2">
        <div className="relative h-[148px] w-[78px] rounded-[18px] border-[3px] border-[var(--ink)] p-[5px]">
          <div className="absolute -top-2 left-1/2 h-2 w-8 -translate-x-1/2 rounded-t-md bg-[var(--ink)]" />
          <div className="relative h-full w-full overflow-hidden rounded-[12px] bg-[var(--fill)]">
            <div
              className="absolute bottom-0 left-0 right-0 rounded-[10px] transition-[height] duration-700"
              style={{ height: `${fill}%`, background: color }}
            />
          </div>
        </div>
        <div className="pl-3 text-left">
          <div className="font-display text-[40px] font-semibold leading-none tabular-nums tracking-tight">
            {fill.toFixed(0)}
            <span className="text-[18px]">%</span>
          </div>
          <div className="mt-2 text-[12px] text-[var(--secondary)]">余电</div>
          <div className="mt-4 font-display text-[18px] tabular-nums">
            {formatInt(life.remainingHours)} 小时
          </div>
          <div className="text-[12px] tabular-nums text-[var(--secondary)]">
            {String(life.remainingMinutes).padStart(2, "0")} 分{" "}
            {String(life.remainingSeconds).padStart(2, "0")} 秒
          </div>
        </div>
      </div>
    </div>
  );
}

function lifeClock(life: LifeSnapshot) {
  const t = Math.min(0.999, Math.max(0, life.livedRatio));
  const hours = t * 12;
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.floor((((hours - h) * 60) - m) * 60);
  return { hours, h, m, s, t };
}

function ClockFace({ life }: { life: LifeSnapshot }) {
  const { hours, t } = lifeClock(life);
  const hourAngle = hours * 30;
  const remainAngle = (1 - t) * 360;
  const r = 88;
  const c = 2 * Math.PI * r;
  const dash = (remainAngle / 360) * c;
  return (
    <div className="flex flex-col items-center py-1">
      <svg viewBox="0 0 200 200" className="h-[200px] w-[200px]">
        <circle cx="100" cy="100" r="92" fill="var(--elevated)" stroke="var(--line)" strokeWidth="2" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = ((i * 30 - 90) * Math.PI) / 180;
          const x1 = 100 + Math.cos(a) * 78;
          const y1 = 100 + Math.sin(a) * 78;
          const x2 = 100 + Math.cos(a) * 86;
          const y2 = 100 + Math.sin(a) * 86;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth={i % 3 === 0 ? 2.4 : 1} />;
        })}
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="var(--accent-soft)"
          strokeWidth="8"
          strokeDasharray={`${c}`}
          transform="rotate(-90 100 100)"
        />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 100 100)"
        />
        <line
          x1="100"
          y1="100"
          x2={100 + Math.cos(((hourAngle - 90) * Math.PI) / 180) * 52}
          y2={100 + Math.sin(((hourAngle - 90) * Math.PI) / 180) * 52}
          stroke="var(--ink)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="5" fill="var(--ink)" />
      </svg>
      <p className="mt-2 text-[12px] text-[var(--secondary)]">
        生命时钟指向 {hours.toFixed(2)} 点 · 外圈是还没走的路
      </p>
      <p className="mt-1 font-display text-[20px] tabular-nums">
        {formatInt(life.remainingHours)} 小时 {String(life.remainingMinutes).padStart(2, "0")} 分
      </p>
    </div>
  );
}

function Dots({ life }: { life: LifeSnapshot }) {
  const totalWeeks = Math.max(1, Math.round(life.totalMs / (7 * 86400000)));
  const livedWeeks = Math.min(totalWeeks, Math.round(life.livedMs / (7 * 86400000)));
  const maxDots = 364;
  const step = Math.max(1, Math.ceil(totalWeeks / maxDots));
  const dots = Math.ceil(totalWeeks / step);
  const livedDots = Math.floor(livedWeeks / step);
  return (
    <div className="py-1">
      <div className="mx-auto grid max-w-[320px] grid-cols-[repeat(26,minmax(0,1fr))] gap-[3px]">
        {Array.from({ length: dots }, (_, i) => (
          <span
            key={i}
            className={cn(
              "aspect-square rounded-[1.5px]",
              i < livedDots
                ? "bg-[var(--lived)]"
                : i === livedDots
                  ? "bg-[var(--accent)] animate-pulse"
                  : "bg-[var(--remain-dot)]",
            )}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-[12px] text-[var(--secondary)]">
        一格约 {step} 周 · 已过 {formatInt(livedWeeks)} / {formatInt(totalWeeks)} 周
      </p>
      <p className="mt-1 text-center font-display text-[18px] tabular-nums">
        {formatInt(life.remainingHours)} 小时 {String(life.remainingMinutes).padStart(2, "0")}:{String(life.remainingSeconds).padStart(2, "0")}
      </p>
    </div>
  );
}

function Ring({ life }: { life: LifeSnapshot }) {
  const remain = 1 - life.livedRatio;
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative">
        <svg viewBox="0 0 180 180" className="h-[188px] w-[188px]">
          <circle cx="90" cy="90" r={r} fill="none" stroke="var(--fill)" strokeWidth="14" />
          <circle
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${remain * c} ${c}`}
            transform="rotate(-90 90 90)"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-display text-[28px] font-semibold tabular-nums leading-none">
              {formatInt(life.remainingHours)}
            </div>
            <div className="mt-1 text-[11px] tracking-[0.16em] text-[var(--secondary)]">小时              小时
            </div>
            <div className="mt-2 text-[13px] tabular-nums text-[var(--secondary)]">
              {String(life.remainingMinutes).padStart(2, "0")} : {String(life.remainingSeconds).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CountdownSkin({ skin, life }: { skin: SkinId; life: LifeSnapshot }) {
  switch (skin) {
    case "progress":
      return <Progress life={life} />;
    case "battery":
      return <Battery life={life} />;
    case "clock":
      return <ClockFace life={life} />;
    case "dots":
      return <Dots life={life} />;
    case "ring":
      return <Ring life={life} />;
    default:
      return <Digits life={life} />;
  }
}
