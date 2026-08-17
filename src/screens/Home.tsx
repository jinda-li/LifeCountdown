import { SKINS } from "@/data/rewards";
import { METRICS } from "@/data/metrics";
import { CountdownSkin } from "@/components/countdown/Skins";
import { quoteForDate } from "@/data/quotes";
import { formatInt, greeting } from "@/lib/format";
import { snapshot } from "@/lib/life";
import { metricValue } from "@/lib/notify";
import { useApp } from "@/lib/store";
import { useISOToday, useNow } from "@/lib/useNow";
import { haptic } from "@/lib/haptics";
import { Lock } from "lucide-react";
import { useState } from "react";

export function HomeScreen() {
  const now = useNow(1000);
  const today = useISOToday();
  const profile = useApp((s) => s.profile)!;
  const skin = useApp((s) => s.skin);
  const setSkin = useApp((s) => s.setSkin);
  const unlockedSkins = useApp((s) => s.unlockedSkins);
  const selectedMetrics = useApp((s) => s.selectedMetrics);
  const rates = useApp((s) => s.metricRates);
  const journals = useApp((s) => s.journals);
  const setTab = useApp((s) => s.setTab);
  const setEveningOpen = useApp((s) => s.setEveningOpen);
  const light = useApp((s) => s.light);
  const streak = useApp((s) => {
    const journals = s.journals;
    let n = 0;
    const d = new Date(today);
    for (;;) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const iso = `${y}-${m}-${day}`;
      if (!journals[iso]) break;
      n += 1;
      d.setDate(d.getDate() - 1);
    }
    return n;
  });

  const life = snapshot({
    birthISO: profile.birthISO,
    countryId: profile.countryId,
    gender: profile.gender,
    now,
  });

  const wrote = Boolean(journals[today]);
  const evening = now.getHours() >= 18;
  const [skinHint, setSkinHint] = useState("");

  return (
    <div className="scroll">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] tracking-[0.16em] text-[var(--secondary)]">
            {greeting(now)} · {profile.name}
          </p>
          <h1 className="large-title mt-1">此刻</h1>
        </div>
        <div className="rounded-full bg-[var(--fill)] px-3 py-1 text-[12px] text-[var(--secondary)]">
          {streak > 0 ? `连续 ${streak} 天 · ` : ""}晨光 {light}
        </div>
      </div>

      <div className="card mt-5 px-4 py-5">
        {life.surpassed ? (
          <p className="text-center text-[16px] leading-7">
            你已经走过了统计意义上的预期。
            <br />
            从今天起，每一天都是赠礼。
          </p>
        ) : (
          <CountdownSkin skin={skin} life={life} />
        )}
      </div>

      <div className="chip-scroll mt-3">
        {SKINS.map((s) => {
          const on = skin === s.id;
          const locked = !unlockedSkins.includes(s.id);
          return (
            <button
              key={s.id}
              className={`chip shrink-0 ${on ? "on" : ""}`}
              onClick={() => {
                haptic();
                if (locked) setSkinHint(`「${s.name}」还锁着。写下日记或到「我的」用晨光兑换。`);
                else {
                  setSkinHint("");
                  setSkin(s.id);
                }
              }}
            >
              {locked && <Lock size={11} strokeWidth={2} />}
              {s.name}
            </button>
          );
        })}
      </div>
      {skinHint && <p className="mt-2 text-[12px] text-[var(--secondary)]">{skinHint}</p>}

      <p className="mt-6 text-[17px] leading-7">{quoteForDate(today)}</p>
      <p className="mt-2 text-[13px] text-[var(--secondary)]">
        预计大约还有 {formatInt(life.remainingWeeks)} 周离开这个世界。不是为了害怕，是为了把今天过热。
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {selectedMetrics.map((id) => {
          const def = METRICS.find((m) => m.id === id)!;
          const value = metricValue(id, life, rates);
          return (
            <button
              key={id}
              className="card px-4 py-4 text-left"
              onClick={() => useApp.setState({ tab: "me", panel: "metrics" })}
            >
              <div className="text-[12px] text-[var(--secondary)]">{def.name}</div>
              <div className="mt-2 font-display text-[22px] font-semibold tabular-nums tracking-tight">
                {formatInt(value)}
              </div>
              <div className="mt-1 text-[11px] text-[var(--tertiary)]">{def.unit}</div>
            </button>
          );
        })}
      </div>

      <button
        className="card mt-3 w-full px-4 py-4 text-left"
        onClick={() => useApp.setState({ tab: "me", panel: "metrics" })}
      >
        <div className="text-[15px] font-medium">想看见还剩什么</div>
        <div className="mt-1 text-[13px] text-[var(--secondary)]">日出、吃饭、旅行、拥抱……自己选。</div>
      </button>

      <button
        className="primary-btn mt-5"
        onClick={() => {
          haptic();
          if (evening && !wrote) setEveningOpen(true);
          else setTab("journal");
        }}
      >
        {wrote ? "今天已经写下了" : evening ? "今晚回顾 · 你今天又过去了一天" : "写下今天"}
      </button>

      <ShareRow hours={life.remainingHours} weeks={life.remainingWeeks} />
      <InstallTip />
    </div>
  );
}

function ShareRow({ hours, weeks }: { hours: number; weeks: number }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="ghost-btn mt-2"
      onClick={async () => {
        const text = `今天是我余生里最年轻的一天。\n大约还剩 ${formatInt(hours)} 小时，${formatInt(weeks)} 周。\n—— 今日最年轻`;
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          /* ignore */
        }
        haptic();
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? "已复制到剪贴板" : "复制今天的余生"}
    </button>
  );
}

function InstallTip() {
  const [show, setShow] = useState(() => {
    try {
      return localStorage.getItem("youngest.tip.install") !== "1";
    } catch {
      return false;
    }
  });
  if (!show) return null;
  return (
    <div className="card mt-4 px-4 py-4">
      <p className="text-[15px] font-medium">放到主屏幕</p>
      <p className="mt-1 text-[13px] leading-6 text-[var(--secondary)]">
        iPhone：Safari 底部分享按钮 → 添加到主屏幕。Android：浏览器菜单 → 添加到主屏幕。之后晚上的提醒会更准时。
      </p>
      <button
        className="chip mt-3"
        onClick={() => {
          localStorage.setItem("youngest.tip.install", "1");
          setShow(false);
        }}
      >
        知道了
      </button>
    </div>
  );
}
