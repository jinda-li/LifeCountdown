import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_METRICS, METRICS, type MetricId } from "../data/metrics";
import {
  SKINS,
  THEMES,
  autoUnlockedMetrics,
  autoUnlockedSkins,
  autoUnlockedThemes,
  type SkinId,
  type ThemeId,
} from "../data/rewards";
import { toISODate } from "./format";
import type { Gender } from "./life";

export type TabId = "home" | "grid" | "journal" | "boards" | "me";

export type JournalEntry = {
  date: string;
  did: string;
  meaningful: 1 | 2 | 3;
  grateful: string;
  updatedAt: string;
};

export type Board = {
  id: string;
  title: string;
  emoji: string;
};

export type TaskStatus = "wish" | "doing" | "done";

export type LifeTask = {
  id: string;
  boardId: string;
  title: string;
  note: string;
  status: TaskStatus;
  due?: string;
  createdAt: string;
  doneAt?: string;
};

export type Profile = {
  name: string;
  birthISO: string;
  countryId: string;
  city: string;
  gender: Gender;
};

export type AppState = {
  onboarded: boolean;
  profile: Profile | null;
  tab: TabId;
  theme: ThemeId;
  skin: SkinId;
  selectedMetrics: MetricId[];
  metricRates: Partial<Record<MetricId, number>>;
  journals: Record<string, JournalEntry>;
  boards: Board[];
  tasks: LifeTask[];
  light: number;
  unlockedSkins: SkinId[];
  unlockedThemes: ThemeId[];
  unlockedMetrics: MetricId[];
  notifyEnabled: boolean;
  notifyHour: number;
  lastNotifyDate: string | null;
  lastUnlock: { kind: "skin" | "theme" | "metric"; id: string; name: string } | null;
  eveningOpen: boolean;
  panel: "metrics" | "shop" | null;
  setTab: (tab: TabId) => void;
  setPanel: (panel: "metrics" | "shop" | null) => void;
  completeOnboarding: (profile: Profile) => void;
  saveJournal: (entry: JournalEntry) => void;
  setSkin: (id: SkinId) => void;
  setTheme: (id: ThemeId) => void;
  toggleMetric: (id: MetricId) => void;
  setMetricRate: (id: MetricId, perYear: number) => void;
  unlockWithLight: (kind: "skin" | "theme" | "metric", id: string) => boolean;
  addBoard: (title: string, emoji: string) => void;
  addTask: (task: Omit<LifeTask, "id" | "createdAt">) => void;
  updateTask: (id: string, patch: Partial<LifeTask>) => void;
  deleteTask: (id: string) => void;
  setNotify: (enabled: boolean, hour?: number) => void;
  markNotified: (date: string) => void;
  setEveningOpen: (open: boolean) => void;
  clearLastUnlock: () => void;
  resetAll: () => void;
};

const defaultBoards: Board[] = [
  { id: "places", title: "想去的地方", emoji: "◎" },
  { id: "skills", title: "想学会的事", emoji: "◇" },
  { id: "become", title: "想成为的人", emoji: "○" },
  { id: "people", title: "想好好陪伴", emoji: "☆" },
];

function uid() {
  return crypto.randomUUID();
}

function journalCount(journals: Record<string, JournalEntry>) {
  return Object.keys(journals).length;
}

function mergeUnlocks(journals: Record<string, JournalEntry>, extra: {
  unlockedSkins: SkinId[];
  unlockedThemes: ThemeId[];
  unlockedMetrics: MetricId[];
}) {
  const n = journalCount(journals);
  return {
    unlockedSkins: Array.from(new Set([...autoUnlockedSkins(n), ...extra.unlockedSkins])),
    unlockedThemes: Array.from(new Set([...autoUnlockedThemes(n), ...extra.unlockedThemes])),
    unlockedMetrics: Array.from(new Set([...autoUnlockedMetrics(n), ...extra.unlockedMetrics])),
  };
}

function streakOf(journals: Record<string, JournalEntry>, todayISO: string) {
  let n = 0;
  const d = new Date(todayISO);
  for (;;) {
    const iso = toISODate(d);
    if (!journals[iso]) break;
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      profile: null,
      tab: "home",
      theme: "dawn",
      skin: "digits",
      selectedMetrics: [...DEFAULT_METRICS],
      metricRates: {},
      journals: {},
      boards: defaultBoards,
      tasks: [],
      light: 0,
      unlockedSkins: ["digits"],
      unlockedThemes: ["dawn"],
      unlockedMetrics: DEFAULT_METRICS,
      notifyEnabled: false,
      notifyHour: 21,
      lastNotifyDate: null,
      lastUnlock: null,
      eveningOpen: false,
      panel: null,
      setTab: (tab) => set({ tab, panel: tab === "me" ? get().panel : null }),
      setPanel: (panel) => set({ panel }),
      completeOnboarding: (profile) =>
        set({
          onboarded: true,
          profile,
          tab: "home",
        }),
      saveJournal: (entry) => {
        const prev = get().journals[entry.date];
        const journals = { ...get().journals, [entry.date]: entry };
        const firstToday = !prev;
        const unlocks = mergeUnlocks(journals, get());
        const newly: AppState["lastUnlock"][] = [];
        for (const s of SKINS) {
          if (unlocks.unlockedSkins.includes(s.id) && !get().unlockedSkins.includes(s.id)) {
            newly.push({ kind: "skin", id: s.id, name: s.name });
          }
        }
        for (const t of THEMES) {
          if (unlocks.unlockedThemes.includes(t.id) && !get().unlockedThemes.includes(t.id)) {
            newly.push({ kind: "theme", id: t.id, name: t.name });
          }
        }
        for (const m of METRICS) {
          if (unlocks.unlockedMetrics.includes(m.id) && !get().unlockedMetrics.includes(m.id)) {
            newly.push({ kind: "metric", id: m.id, name: m.name });
          }
        }
        const bonus = firstToday ? 1 + (streakOf(journals, entry.date) === 7 ? 3 : 0) : 0;
        set({
          journals,
          light: get().light + bonus,
          ...unlocks,
          lastUnlock: newly[0] ?? get().lastUnlock,
        });
      },
      setSkin: (id) => {
        if (get().unlockedSkins.includes(id)) set({ skin: id });
      },
      setTheme: (id) => {
        if (get().unlockedThemes.includes(id)) set({ theme: id });
      },
      toggleMetric: (id) => {
        if (!get().unlockedMetrics.includes(id)) return;
        const selected = get().selectedMetrics;
        if (selected.includes(id)) {
          if (selected.length === 1) return;
          set({ selectedMetrics: selected.filter((x) => x !== id) });
        } else {
          if (selected.length >= 6) return;
          set({ selectedMetrics: [...selected, id] });
        }
      },
      setMetricRate: (id, perYear) =>
        set({ metricRates: { ...get().metricRates, [id]: perYear } }),
      unlockWithLight: (kind, id) => {
        const { light } = get();
        if (kind === "skin") {
          const skin = SKINS.find((s) => s.id === id);
          if (!skin || get().unlockedSkins.includes(skin.id) || light < skin.cost) return false;
          set({
            light: light - skin.cost,
            unlockedSkins: [...get().unlockedSkins, skin.id],
            skin: skin.id,
            lastUnlock: { kind, id: skin.id, name: skin.name },
          });
          return true;
        }
        if (kind === "theme") {
          const theme = THEMES.find((t) => t.id === id);
          if (!theme || get().unlockedThemes.includes(theme.id) || light < theme.cost) return false;
          set({
            light: light - theme.cost,
            unlockedThemes: [...get().unlockedThemes, theme.id],
            theme: theme.id,
            lastUnlock: { kind, id: theme.id, name: theme.name },
          });
          return true;
        }
        const metric = METRICS.find((m) => m.id === id);
        if (!metric || get().unlockedMetrics.includes(metric.id) || light < 2) return false;
        set({
          light: light - 2,
          unlockedMetrics: [...get().unlockedMetrics, metric.id],
          lastUnlock: { kind, id: metric.id, name: metric.name },
        });
        return true;
      },
      addBoard: (title, emoji) =>
        set({ boards: [...get().boards, { id: uid(), title, emoji }] }),
      addTask: (task) =>
        set({
          tasks: [
            ...get().tasks,
            { ...task, id: uid(), createdAt: new Date().toISOString() },
          ],
        }),
      updateTask: (id, patch) =>
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }),
      deleteTask: (id) => set({ tasks: get().tasks.filter((t) => t.id !== id) }),
      setNotify: (enabled, hour) =>
        set({ notifyEnabled: enabled, notifyHour: hour ?? get().notifyHour }),
      markNotified: (date) => set({ lastNotifyDate: date }),
      setEveningOpen: (open) => set({ eveningOpen: open }),
      clearLastUnlock: () => set({ lastUnlock: null }),
      resetAll: () =>
        set({
          onboarded: false,
          profile: null,
          tab: "home",
          theme: "dawn",
          skin: "digits",
          selectedMetrics: [...DEFAULT_METRICS],
          metricRates: {},
          journals: {},
          boards: defaultBoards,
          tasks: [],
          light: 0,
          unlockedSkins: ["digits"],
          unlockedThemes: ["dawn"],
          unlockedMetrics: DEFAULT_METRICS,
          notifyEnabled: false,
          notifyHour: 21,
          lastNotifyDate: null,
          lastUnlock: null,
          eveningOpen: false,
          panel: null,
        }),
    }),
    {
      name: "youngest.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        profile: s.profile,
        theme: s.theme,
        skin: s.skin,
        selectedMetrics: s.selectedMetrics,
        metricRates: s.metricRates,
        journals: s.journals,
        boards: s.boards,
        tasks: s.tasks,
        light: s.light,
        unlockedSkins: s.unlockedSkins,
        unlockedThemes: s.unlockedThemes,
        unlockedMetrics: s.unlockedMetrics,
        notifyEnabled: s.notifyEnabled,
        notifyHour: s.notifyHour,
        lastNotifyDate: s.lastNotifyDate,
      }),
    },
  ),
);

export function useJournalStreak() {
  const journals = useApp((s) => s.journals);
  const today = toISODate(new Date());
  return streakOf(journals, today);
}
