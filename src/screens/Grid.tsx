import { useMemo, useState } from "react";
import { LifeCanvas } from "@/components/LifeCanvas";
import { formatInt } from "@/lib/format";
import { snapshot } from "@/lib/life";
import { useApp } from "@/lib/store";
import { useNow } from "@/lib/useNow";

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
          <LifeCanvas cols={weeks.cols} total={weeks.total} lived={livedWeeks} mode="weeks" />
        ) : (
          <LifeCanvas cols={10} total={years} lived={livedYears} mode="years" />
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
