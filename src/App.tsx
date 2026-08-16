import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TabBar } from "@/components/TabBar";
import { HomeScreen } from "@/screens/Home";
import { GridScreen } from "@/screens/Grid";
import { JournalScreen } from "@/screens/Journal";
import { BoardsScreen } from "@/screens/Boards";
import { MeScreen } from "@/screens/Me";
import { Onboarding } from "@/screens/Onboarding";
import { EVENING_LINES } from "@/data/quotes";
import { hapticSuccess } from "@/lib/haptics";
import { showEveningNotification } from "@/lib/notify";
import { useApp } from "@/lib/store";
import { useISOToday } from "@/lib/useNow";
import { toISODate } from "@/lib/format";

export default function App() {
  const onboarded = useApp((s) => s.onboarded);
  const theme = useApp((s) => s.theme);
  const tab = useApp((s) => s.tab);
  const setTab = useApp((s) => s.setTab);
  const journals = useApp((s) => s.journals);
  const eveningOpen = useApp((s) => s.eveningOpen);
  const setEveningOpen = useApp((s) => s.setEveningOpen);
  const notifyEnabled = useApp((s) => s.notifyEnabled);
  const notifyHour = useApp((s) => s.notifyHour);
  const lastNotifyDate = useApp((s) => s.lastNotifyDate);
  const markNotified = useApp((s) => s.markNotified);
  const lastUnlock = useApp((s) => s.lastUnlock);
  const clearLastUnlock = useApp((s) => s.clearLastUnlock);
  const today = useISOToday();
  const [hydrated, setHydrated] = useState(() => useApp.persist.hasHydrated());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    if (meta && bg) meta.setAttribute("content", bg);
  }, [theme]);

  useEffect(() => {
    const done = () => setHydrated(true);
    const unsub = useApp.persist.onFinishHydration(done);
    if (useApp.persist.hasHydrated()) done();
    return unsub;
  }, []);

  useEffect(() => {
    if (!onboarded || !notifyEnabled) return;
    const tick = () => {
      const n = new Date();
      const iso = toISODate(n);
      if (n.getHours() < notifyHour) return;
      if (journals[iso]) return;
      if (lastNotifyDate === iso) return;
      showEveningNotification();
      markNotified(iso);
      setEveningOpen(true);
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [onboarded, notifyEnabled, notifyHour, journals, lastNotifyDate, markNotified, setEveningOpen]);

  if (!hydrated) {
    return (
      <div className="app-root">
        <div className="phone grid place-items-center">
          <p className="tracking-[0.28em] text-[var(--secondary)]">YOUNGEST</p>
        </div>
      </div>
    );
  }

  const needJournal = onboarded && !journals[today];

  return (
    <div className="app-root">
      <div className="phone">
        {!onboarded ? (
          <Onboarding />
        ) : (
          <div className="screen relative">
            {tab === "home" && <HomeScreen />}
            {tab === "grid" && <GridScreen />}
            {tab === "journal" && <JournalScreen />}
            {tab === "boards" && <BoardsScreen />}
            {tab === "me" && <MeScreen />}
            <TabBar tab={tab} onChange={setTab} badge={{ journal: needJournal }} />
          </div>
        )}

        <AnimatePresence>
          {onboarded && eveningOpen && (
            <motion.div
              className="absolute inset-0 z-40 flex items-end bg-black/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                className="m-3 mb-[max(16px,env(safe-area-inset-bottom))] w-[calc(100%-24px)] rounded-[28px] bg-[var(--elevated)] p-6"
              >
                <p className="text-[13px] tracking-[0.18em] text-[var(--secondary)]">每日回顾</p>
                <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight">
                  {EVENING_LINES[0]}
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-[var(--secondary)]">
                  邀请你写一写今天做了什么。是不是度过了有意义、有价值的一天？写下来，就能点亮新的皮肤。
                </p>
                <button
                  className="primary-btn mt-6"
                  onClick={() => {
                    setEveningOpen(false);
                    useApp.setState({ tab: "journal" });
                  }}
                >
                  写下今天
                </button>
                <button className="ghost-btn mt-2" onClick={() => setEveningOpen(false)}>
                  稍后再说
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {lastUnlock && (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="absolute left-4 right-4 top-[max(28px,env(safe-area-inset-top))] z-50 rounded-2xl bg-[var(--ink)] px-4 py-3 text-left text-[var(--bg)]"
              onClick={() => {
                hapticSuccess();
                clearLastUnlock();
                useApp.setState({ tab: "me" });
              }}
            >
              <div className="text-[12px] tracking-[0.16em] opacity-70">已解锁</div>
              <div className="text-[16px] font-medium">{lastUnlock.name}</div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
