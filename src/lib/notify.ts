import { METRICS, type MetricId } from "../data/metrics";
import { formatInt } from "./format";
import { remainingCount, type LifeSnapshot } from "./life";

export function metricValue(
  id: MetricId,
  life: LifeSnapshot,
  rates: Partial<Record<MetricId, number>>,
) {
  const def = METRICS.find((m) => m.id === id)!;
  const perYear = rates[id] ?? def.perYear;
  return remainingCount(life.remainingYears, perYear);
}

export function metricLabel(id: MetricId, value: number) {
  const def = METRICS.find((m) => m.id === id)!;
  return `${formatInt(value)} ${def.unit}`;
}

export async function requestNotifyPermission() {
  if (typeof Notification === "undefined") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

export function showEveningNotification() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification("今日最年轻", {
      body: "你今天又过去了一天。今晚要不要写一写，今天做了什么？",
      lang: "zh-CN",
      tag: "youngest-evening",
      silent: false,
    });
  } catch {
    /* iOS Safari may throw unless installed to home screen */
  }
}
