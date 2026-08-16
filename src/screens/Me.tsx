import { useEffect, useState } from "react";
import { METRICS } from "@/data/metrics";
import { SKINS, THEMES } from "@/data/rewards";
import { Sheet } from "@/components/ui/Sheet";
import { getCountry, snapshot } from "@/lib/life";
import { formatInt } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { requestNotifyPermission } from "@/lib/notify";
import { useApp } from "@/lib/store";
import { useNow } from "@/lib/useNow";
import { Lock } from "lucide-react";

export function MeScreen() {
  const now = useNow(30_000);
  const profile = useApp((s) => s.profile)!;
  const theme = useApp((s) => s.theme);
  const skin = useApp((s) => s.skin);
  const setTheme = useApp((s) => s.setTheme);
  const setSkin = useApp((s) => s.setSkin);
  const light = useApp((s) => s.light);
  const unlockedSkins = useApp((s) => s.unlockedSkins);
  const unlockedThemes = useApp((s) => s.unlockedThemes);
  const unlockedMetrics = useApp((s) => s.unlockedMetrics);
  const selectedMetrics = useApp((s) => s.selectedMetrics);
  const toggleMetric = useApp((s) => s.toggleMetric);
  const unlockWithLight = useApp((s) => s.unlockWithLight);
  const metricRates = useApp((s) => s.metricRates);
  const setMetricRate = useApp((s) => s.setMetricRate);
  const notifyEnabled = useApp((s) => s.notifyEnabled);
  const notifyHour = useApp((s) => s.notifyHour);
  const setNotify = useApp((s) => s.setNotify);
  const journals = useApp((s) => s.journals);
  const resetAll = useApp((s) => s.resetAll);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [shop, setShop] = useState(false);
  const [notifyHint, setNotifyHint] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const panel = useApp((s) => s.panel);
  const setPanel = useApp((s) => s.setPanel);

  useEffect(() => {
    if (panel === "metrics") setMetricsOpen(true);
    if (panel === "shop") setShop(true);
  }, [panel]);

  const country = getCountry(profile.countryId);
  const life = snapshot({
    birthISO: profile.birthISO,
    countryId: profile.countryId,
    gender: profile.gender,
    now,
  });
  const days = Object.keys(journals).length;

  return (
    <div className="screen">
    <div className="scroll">
      <p className="text-[13px] tracking-[0.16em] text-[var(--secondary)]">YOU</p>
      <h1 className="large-title mt-1">{profile.name}</h1>
      <p className="mt-2 text-[15px] text-[var(--secondary)]">
        {country.nameZh}
        {profile.city ? ` · ${profile.city}` : ""} · {profile.birthISO}
      </p>
      <p className="mt-1 text-[13px] text-[var(--tertiary)]">
        预期寿命约 {profile.gender === "female" ? country.female : profile.gender === "male" ? country.male : country.le} 岁
        · 已记录 {days} 天 · 晨光 {light}
      </p>

      <div className="card mt-5 divide-y divide-[var(--line)] overflow-hidden">
        <Row label="倒计时皮肤" value={SKINS.find((s) => s.id === skin)?.name} onClick={() => setShop(true)} />
        <Row label="外观" value={THEMES.find((t) => t.id === theme)?.name} onClick={() => setShop(true)} />
        <Row label="还剩什么" value={`${selectedMetrics.length} 项`} onClick={() => setMetricsOpen(true)} />
      </div>

      <div className="card mt-3 divide-y divide-[var(--line)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-[16px]">每晚提醒</div>
            <div className="text-[12px] text-[var(--secondary)]">「你今天又过去了一天」</div>
          </div>
          <button
            className={`chip ${notifyEnabled ? "on" : ""}`}
            onClick={async () => {
              haptic();
              if (!notifyEnabled) {
                const ok = await requestNotifyPermission();
                setNotify(true);
                setNotifyHint(
                  ok
                    ? "已打开。应用在晚上到达设定时间时会提醒你回顾今天。"
                    : "系统通知未授权。请把网页加到主屏幕后再试。只要打开应用，到点仍会弹出回顾。",
                );
              } else {
                setNotify(false);
                setNotifyHint("");
              }
            }}
          >
            {notifyEnabled ? "开" : "关"}
          </button>
        </div>
        {notifyHint && (
          <p className="px-4 pb-3 text-[12px] leading-5 text-[var(--secondary)]">{notifyHint}</p>
        )}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-[16px]">提醒时间</div>
          <input
            type="number"
            min={18}
            max={23}
            className="w-16 rounded-lg bg-[var(--fill)] px-2 py-1 text-right"
            value={notifyHour}
            onChange={(e) => setNotify(notifyEnabled, Number(e.target.value) || 21)}
          />
        </div>
      </div>

      <p className="mt-5 text-[13px] leading-6 text-[var(--secondary)]">
        数据只保存在这台设备的浏览器里，不会上传。预期寿命来自联合国 2023 年统计，不是健康预测。
      </p>
      <p className="mt-2 text-[13px] text-[var(--secondary)]">
        把应用加到主屏幕，会更像一款属于你的手机软件。
      </p>

      <button className="ghost-btn mt-6 text-[var(--danger)]" onClick={() => setResetOpen(true)}>
        重新开始
      </button>
    </div>

      <Sheet
        open={metricsOpen}
        onClose={() => {
          setMetricsOpen(false);
          setPanel(null);
        }}
        title="想看见还剩什么"
        tall
      >
        <p className="mb-4 text-[13px] text-[var(--secondary)]">最多选 6 项。写日记可解锁更多。</p>
        <div className="space-y-2">
          {METRICS.map((m) => {
            const locked = !unlockedMetrics.includes(m.id);
            const on = selectedMetrics.includes(m.id);
            const rate = metricRates[m.id] ?? m.perYear;
            return (
              <div key={m.id} className="card px-4 py-3">
                <button
                  className="flex w-full items-start justify-between text-left"
                  onClick={() => {
                    haptic();
                    if (locked) unlockWithLight("metric", m.id);
                    else toggleMetric(m.id);
                  }}
                >
                  <div>
                    <div className="text-[16px]">
                      {locked && <Lock size={12} className="mr-1 inline" />}
                      {m.name}
                    </div>
                    <div className="mt-1 text-[12px] text-[var(--secondary)]">{m.hint}</div>
                  </div>
                  <span className={`chip ${on ? "on" : ""}`}>{locked ? "2 晨光" : on ? "显示" : "隐藏"}</span>
                </button>
                {m.customizable && !locked && (
                  <label className="mt-2 flex items-center justify-between text-[12px] text-[var(--secondary)]">
                    每年大约
                    <input
                      type="number"
                      className="w-20 rounded-lg bg-[var(--fill)] px-2 py-1 text-right text-[var(--ink)]"
                      value={Number(rate.toFixed(1))}
                      onChange={(e) => setMetricRate(m.id, Number(e.target.value) || m.perYear)}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </Sheet>

      <Sheet
        open={shop}
        onClose={() => {
          setShop(false);
          setPanel(null);
        }}
        title="晨光商店"
        tall
      >
        <p className="mb-3 text-[13px] text-[var(--secondary)]">
          每天写下今天，即可获得晨光并自动解锁。也可以提前兑换。当前 {light} 晨光。
        </p>
        <p className="mb-2 text-[12px] tracking-[0.14em] text-[var(--tertiary)]">倒计时皮肤</p>
        {SKINS.map((s) => {
          const locked = !unlockedSkins.includes(s.id);
          return (
            <button
              key={s.id}
              className="card mb-2 flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => {
                haptic();
                if (locked) unlockWithLight("skin", s.id);
                else setSkin(s.id);
              }}
            >
              <div>
                <div className="text-[16px]">{s.name}{skin === s.id ? " · 使用中" : ""}</div>
                <div className="text-[12px] text-[var(--secondary)]">{s.blurb}</div>
              </div>
              <span className="text-[12px] text-[var(--tertiary)]">
                {locked ? `${s.cost} 晨光 / 日记 ${s.unlockAt} 天` : "已解锁"}
              </span>
            </button>
          );
        })}
        <p className="mb-2 mt-4 text-[12px] tracking-[0.14em] text-[var(--tertiary)]">外观</p>
        {THEMES.map((t) => {
          const locked = !unlockedThemes.includes(t.id);
          return (
            <button
              key={t.id}
              className="card mb-2 flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => {
                haptic();
                if (locked) unlockWithLight("theme", t.id);
                else setTheme(t.id);
              }}
            >
              <div>
                <div className="text-[16px]">{t.name}{theme === t.id ? " · 使用中" : ""}</div>
                <div className="text-[12px] text-[var(--secondary)]">{t.blurb}</div>
              </div>
              <span className="text-[12px] text-[var(--tertiary)]">
                {locked ? `${t.cost} 晨光` : "已解锁"}
              </span>
            </button>
          );
        })}
        <p className="mt-3 text-[12px] text-[var(--tertiary)]">
          还剩约 {formatInt(life.remainingHours)} 小时。皮肤只是镜子，日子要自己过。
        </p>
      </Sheet>

      <Sheet open={resetOpen} onClose={() => setResetOpen(false)} title="重新开始">
        <p className="text-[15px] leading-7 text-[var(--secondary)]">
          会清除这台设备上的日记、清单和倒计时资料，回到第一次打开的样子。
        </p>
        <button
          className="primary-btn mt-5"
          onClick={() => {
            resetAll();
            setResetOpen(false);
          }}
        >
          清除并离开
        </button>
        <button className="ghost-btn mt-2" onClick={() => setResetOpen(false)}>
          留下
        </button>
      </Sheet>
    </div>
  );
}

function Row({ label, value, onClick }: { label: string; value?: string; onClick: () => void }) {
  return (
    <button className="flex w-full items-center justify-between px-4 py-3.5 text-left" onClick={onClick}>
      <span className="text-[16px]">{label}</span>
      <span className="text-[15px] text-[var(--tertiary)]">{value} ›</span>
    </button>
  );
}
