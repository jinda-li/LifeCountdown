export const MS_DAY = 86_400_000;
export const MS_YEAR = 365.2425 * MS_DAY;

export function pad2(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

export function formatInt(n: number, locale = "zh-CN") {
  return Math.round(n).toLocaleString(locale);
}

export function formatDate(iso: string, locale = "zh-CN") {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(iso: string, days: number) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return "夜深了";
  if (h < 11) return "早安";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  if (h < 22) return "傍晚好";
  return "夜安";
}

export function monthLabel(year: number, month: number) {
  return `${year}年${month}月`;
}

export function weekdayShort(i: number) {
  return ["日", "一", "二", "三", "四", "五", "六"][i];
}
