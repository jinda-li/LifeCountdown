import { METRICS, type MetricId } from "./metrics";

export type SkinId = "digits" | "progress" | "battery" | "clock" | "dots" | "ring";
export type ThemeId = "dawn" | "paper" | "night";

export const SKINS: {
  id: SkinId;
  name: string;
  blurb: string;
  unlockAt: number;
  cost: number;
}[] = [
  { id: "digits", name: "数字", blurb: "余生还剩多少小时、分、秒。", unlockAt: 0, cost: 0 },
  { id: "progress", name: "进度条", blurb: "一条安静的生命进度。", unlockAt: 1, cost: 1 },
  { id: "battery", name: "电池", blurb: "像电量一样看见还剩多少。", unlockAt: 3, cost: 3 },
  { id: "clock", name: "时钟", blurb: "把一生映射成十二小时。", unlockAt: 5, cost: 5 },
  { id: "dots", name: "点点格子", blurb: "一格一周一颗心跳。", unlockAt: 7, cost: 7 },
  { id: "ring", name: "年轮", blurb: "像年轮一样围住今天。", unlockAt: 12, cost: 12 },
];

export const THEMES: {
  id: ThemeId;
  name: string;
  blurb: string;
  unlockAt: number;
  cost: number;
}[] = [
  { id: "dawn", name: "晨曦", blurb: "暖纸与日出。", unlockAt: 0, cost: 0 },
  { id: "paper", name: "月白", blurb: "更接近苹果系统的浅色。", unlockAt: 3, cost: 3 },
  { id: "night", name: "夜航", blurb: "深色，适合晚上回顾。", unlockAt: 7, cost: 5 },
];

export function autoUnlockedSkins(journalDays: number): SkinId[] {
  return SKINS.filter((s) => journalDays >= s.unlockAt).map((s) => s.id);
}

export function autoUnlockedThemes(journalDays: number): ThemeId[] {
  return THEMES.filter((t) => journalDays >= t.unlockAt).map((t) => t.id);
}

export function autoUnlockedMetrics(journalDays: number): MetricId[] {
  return METRICS.filter((m) => journalDays >= m.unlockAt).map((m) => m.id);
}
