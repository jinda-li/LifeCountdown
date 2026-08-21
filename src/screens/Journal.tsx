import { useMemo, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { EVENING_LINES } from "@/data/quotes";
import { addDays, formatDate, monthLabel, toISODate, weekdayShort } from "@/lib/format";
import { haptic, hapticSuccess } from "@/lib/haptics";
import { useApp } from "@/lib/store";
import { useISOToday } from "@/lib/useNow";
import { cn } from "@/lib/cn";

function monthCells(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const start = (first.getDay() + 6) % 7;
  const days = new Date(year, month, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    cells.push(toISODate(new Date(year, month - 1, d)));
  }
  return cells;
}

export function JournalScreen({ forceDate }: { forceDate?: string }) {
  const today = useISOToday();
  const journals = useApp((s) => s.journals);
  const saveJournal = useApp((s) => s.saveJournal);
  const [cursor, setCursor] = useState(() => {
    const d = forceDate ? new Date(forceDate) : new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  });
  const [open, setOpen] = useState<string | null>(forceDate ?? null);
  const cells = useMemo(() => monthCells(cursor.y, cursor.m), [cursor]);
  const entry = open ? journals[open] : undefined;
  const [did, setDid] = useState(entry?.did ?? "");
  const [grateful, setGrateful] = useState(entry?.grateful ?? "");
  const [meaningful, setMeaningful] = useState<1 | 2 | 3>(entry?.meaningful ?? 2);

  const openDay = (iso: string) => {
    haptic();
    const e = journals[iso];
    setDid(e?.did ?? "");
    setGrateful(e?.grateful ?? "");
    setMeaningful(e?.meaningful ?? 2);
    setOpen(iso);
  };

  const save = () => {
    if (!open || !did.trim()) return;
    hapticSuccess();
    saveJournal({
      date: open,
      did: did.trim(),
      grateful: grateful.trim(),
      meaningful,
      updatedAt: new Date().toISOString(),
    });
    setOpen(null);
  };

  const count = Object.keys(journals).length;

  return (
    <>
      <div className="scroll">
        <p className="text-[13px] tracking-[0.16em] text-[var(--secondary)]">DAILY</p>
        <h1 className="large-title mt-1">日记</h1>
        <p className="mt-2 text-[14px] text-[var(--secondary)]">
          写下今天，解锁皮肤与晨光。已记录 {count} 天。
        </p>

        <div className="card mt-5 px-4 py-4 pb-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button className="shrink-0 text-[15px] text-[var(--accent)]" onClick={() => setCursor({ y: cursor.m === 1 ? cursor.y - 1 : cursor.y, m: cursor.m === 1 ? 12 : cursor.m - 1 })}>
              上一月
            </button>
            <div className="min-w-0 truncate text-center text-[16px] font-medium">{monthLabel(cursor.y, cursor.m)}</div>
            <button className="shrink-0 text-[15px] text-[var(--accent)]" onClick={() => setCursor({ y: cursor.m === 12 ? cursor.y + 1 : cursor.y, m: cursor.m === 12 ? 1 : cursor.m + 1 })}>
              下一月
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-[var(--tertiary)]">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i}>{weekdayShort(i)}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-y-1">
            {cells.map((iso, i) => {
              if (!iso) return <div key={i} />;
              const has = Boolean(journals[iso]);
              const isToday = iso === today;
              const future = iso > today;
              return (
                <button
                  key={iso}
                  disabled={future}
                  onClick={() => openDay(iso)}
                  className={cn(
                    "mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-[15px] leading-none",
                    isToday && "cal-today",
                    has && !isToday && "text-[var(--accent)]",
                    future && "opacity-30",
                  )}
                  style={isToday ? { background: "var(--ink)", color: "var(--bg)" } : undefined}
                >
                  {Number(iso.slice(8))}
                  {has && (
                    <span
                      className={cn(
                        "mt-0.5 h-1 w-1 rounded-full",
                        isToday ? "bg-[var(--bg)]" : "bg-[var(--accent)]",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button className="primary-btn mt-5" onClick={() => openDay(today)}>
          {journals[today] ? "编辑今天" : "写今天"}
        </button>

        <div className="mt-6 space-y-3">
          {Object.values(journals)
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .slice(0, 8)
            .map((j) => (
              <button key={j.date} className="card w-full px-4 py-4 text-left" onClick={() => openDay(j.date)}>
                <div className="text-[12px] text-[var(--secondary)]">{formatDate(j.date)}</div>
                <div className="mt-1 line-clamp-2 text-[15px] leading-6">{j.did}</div>
              </button>
            ))}
        </div>
      </div>

      <Sheet open={Boolean(open)} onClose={() => setOpen(null)} title={open ? formatDate(open) : ""} tall>
        {open && (
          <Composer
            iso={open}
            today={today}
            did={did}
            setDid={setDid}
            grateful={grateful}
            setGrateful={setGrateful}
            meaningful={meaningful}
            setMeaningful={setMeaningful}
            onSave={save}
            onPrev={() => open && openDay(addDays(open, -1))}
          />
        )}
      </Sheet>
    </>
  );
}

function Composer({
  iso,
  today,
  did,
  setDid,
  grateful,
  setGrateful,
  meaningful,
  setMeaningful,
  onSave,
  onPrev,
}: {
  iso: string;
  today: string;
  did: string;
  setDid: (v: string) => void;
  grateful: string;
  setGrateful: (v: string) => void;
  meaningful: 1 | 2 | 3;
  setMeaningful: (v: 1 | 2 | 3) => void;
  onSave: () => void;
  onPrev: () => void;
}) {
  const evening = iso === today;
  return (
    <div>
      {evening && (
        <p className="mb-4 text-[16px] leading-7">
          {EVENING_LINES[iso.charCodeAt(iso.length - 1) % EVENING_LINES.length]}
          邀请你写一写今天做了什么——是不是度过了有意义、有价值的一天？
        </p>
      )}
      <p className="mb-2 text-[13px] text-[var(--secondary)]">今天做了什么</p>
      <textarea className="ios-input" value={did} onChange={(e) => setDid(e.target.value)} placeholder="一件具体的事就很好。" />
      <p className="mb-2 mt-4 text-[13px] text-[var(--secondary)]">这一天有意义吗</p>
      <div className="flex gap-2">
        {([1, 2, 3] as const).map((n) => (
          <button key={n} className={`chip flex-1 ${meaningful === n ? "on" : ""}`} onClick={() => setMeaningful(n)}>
            {n === 1 ? "普通" : n === 2 ? "还好" : "很值得"}
          </button>
        ))}
      </div>
      <p className="mb-2 mt-4 text-[13px] text-[var(--secondary)]">想记住的一点好</p>
      <textarea className="ios-input min-h-[80px]" value={grateful} onChange={(e) => setGrateful(e.target.value)} placeholder="一句就够。" />
      <button className="primary-btn mt-5" disabled={!did.trim()} onClick={onSave}>
        放好这一天
      </button>
      <button className="ghost-btn mt-2" onClick={onPrev}>
        看看昨天
      </button>
    </div>
  );
}
