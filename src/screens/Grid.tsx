import { useMemo, useState } from "react";
import { snapshot } from "@/lib/life";
import { useApp } from "@/lib/store";
import { useNow } from "@/lib/useNow";
import { cn } from "@/lib/cn";
import { formatInt } from "@/lib/format";

export function GridScreen() {
  const now = useNow(60_000);
  const profile = useApp((s) => s.profile)!;
  const [mode, setMode] = useState<"weeks" | "years">("weeks");
  const life = snapshot({
    birthISO: profile.birthISO,
    countryId: profile.countryId,
    gender: profile.gender,
    now,
  });

  const years = Math.max(40, Math.ceil(life.deathAge));
  const livedYears = Math.min(years, Math.floor(life.ageYears));
  const currentYearFrac = life.ageYears - Math.floor(life.ageYears);

  const weeks = useMemo(() => {
    const cols = 52;
    const rows = years;
    return { cols, rows, total: cols * rows };
  }, [years]);

  const livedWeeks = Math.min(weeks.total, Math.floor(life.ageYears * 52.1775));

  return (
    <div className="scroll">
      <p className="text-[13px] tracking-[0.16em] text-[var(--secondary)]">LIFE CALENDAR</p>
      <h1 className="large-title mt-1">格子</h1>
      <p className="mt-3 text-[15px] leading-6 text-[var(--secondary)]">
        每一格是你生命里的一周。深色是已经走过的，亮着的是这一周，浅色是还没来的——也是你还可以使用的。
      </p>

      <div className="mt-4 flex gap-2">
        <button className={`chip ${mode === "weeks" ? "on" : ""}`} onClick={() => setMode("weeks")}>
          周
        </button>
        <button className={`chip ${mode === "years" ? "on" : ""}`} onClick={() => setMode("years")}>
          年
        </button>
      </div>

      <div className="card mt-4 px-3 py-4">
        {mode === "weeks" ? (
          <div
            className="grid gap-[2px]"
            style={{ gridTemplateColumns: `repeat(${weeks.cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: weeks.total }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "aspect-square rounded-[0.8px]",
                  i < livedWeeks
                    ? "bg-[var(--lived)]"
                    : i === livedWeeks
                      ? "bg-[var(--accent)]"
                      : "bg-[var(--remain-dot)]",
                )}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-10 gap-2">
            {Array.from({ length: years }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "aspect-square rounded-md",
                  i < livedYears
                    ? "bg-[var(--lived)]"
                    : i === livedYears
                      ? "bg-[var(--accent)]"
                      : "bg-[var(--remain-dot)]",
                )}
                style={
                  i === livedYears
                    ? { boxShadow: `inset 0 0 0 2px var(--accent)`, background: `linear-gradient(to top, var(--accent) ${currentYearFrac * 100}%, var(--remain-dot) ${currentYearFrac * 100}%)` }
                    : undefined
                }
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-between text-[11px] text-[var(--tertiary)]">
          <span>出生</span>
          <span>约 {formatInt(life.remainingWeeks)} 周未走</span>
          <span>预期 {life.deathAge.toFixed(0)} 岁</span>
        </div>
      </div>
    </div>
  );
}
