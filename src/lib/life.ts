import countries from "../data/countries.json";
import { MS_DAY, MS_YEAR } from "./format";

export type Gender = "male" | "female" | "other";

export type Country = (typeof countries)[number];

export const COUNTRIES: Country[] = countries as Country[];

export const WORLD = COUNTRIES.find((c) => c.id === "world")!;

const ALIASES: Record<string, string[]> = {
  china: ["中国", "内地", "大陆", "zhongguo", "prc"],
  "hong-kong": ["香港", "hk", "xianggang"],
  macau: ["澳门", "aomen", "macao"],
  taiwan: ["台湾", "taipei", "tw"],
  singapore: ["新加坡", "sg"],
  "united-states": ["美国", "usa", "us", "america"],
  "united-kingdom": ["英国", "uk", "britain", "england"],
  japan: ["日本", "riben", "jp"],
  "south-korea": ["韩国", "korea", "hanguo", "kr"],
  canada: ["加拿大"],
  australia: ["澳大利亚", "澳洲"],
  germany: ["德国"],
  france: ["法国"],
  malaysia: ["马来西亚", "大马"],
  thailand: ["泰国"],
  vietnam: ["越南"],
  india: ["印度"],
};

export function searchCountries(query: string) {
  const q = query.trim().toLowerCase();
  const list = COUNTRIES.filter((c) => c.id !== "world");
  if (!q) {
    return [...list].sort((a, b) => a.priority - b.priority || a.nameZh.localeCompare(b.nameZh, "zh"));
  }
  return list
    .map((c) => {
      const aliases = ALIASES[c.id] ?? [];
      const hay = [c.nameZh, c.nameEn, c.id, ...aliases].join(" ").toLowerCase();
      const hit =
        c.nameZh.includes(query.trim()) ||
        hay.includes(q) ||
        aliases.some((a) => a.includes(query.trim()));
      const score = c.nameZh.startsWith(query.trim()) || c.nameEn.toLowerCase().startsWith(q) ? 0 : 1;
      return { c, hit, score };
    })
    .filter((x) => x.hit)
    .sort((a, b) => a.score - b.score || a.c.priority - b.c.priority)
    .map((x) => x.c);
}

export function getCountry(id: string) {
  return COUNTRIES.find((c) => c.id === id) ?? WORLD;
}

export function ageYears(birth: Date, now: Date) {
  return (now.getTime() - birth.getTime()) / MS_YEAR;
}

function lerp(a: number, b: number, t: number) {
  const x = Math.min(1, Math.max(0, t));
  return a + (b - a) * x;
}

export function genderFactor(country: Country, gender: Gender) {
  const base = country.le || 73.17;
  if (gender === "male") return country.male / base;
  if (gender === "female") return country.female / base;
  return 1;
}

export function expectedDeathAge(age: number, country: Country, gender: Gender) {
  const f = genderFactor(country, gender);
  const at0 = gender === "male" ? country.male : gender === "female" ? country.female : country.le;
  const rem15 = gender === "male" ? country.male15 : gender === "female" ? country.female15 : country.le15;
  const at65 = country.le65 * f;
  const at80 = country.le80 * f;

  const death0 = at0;
  const death15 = 15 + rem15;
  const death65 = 65 + at65;
  const death80 = 80 + at80;

  if (!Number.isFinite(age) || age < 0) return death0;
  if (age < 15) return lerp(death0, death15, age / 15);
  if (age < 65) return lerp(death15, death65, (age - 15) / 50);
  if (age < 80) return lerp(death65, death80, (age - 65) / 15);
  const remaining = Math.max(1.25, at80 - (age - 80) * 0.62);
  return age + remaining;
}

export type LifeSnapshot = {
  now: Date;
  birth: Date;
  ageYears: number;
  deathAge: number;
  deathAt: Date;
  remainingMs: number;
  livedMs: number;
  totalMs: number;
  remainingYears: number;
  remainingDays: number;
  remainingWeeks: number;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
  livedRatio: number;
  surpassed: boolean;
  country: Country;
};

export function snapshot(input: {
  birthISO: string;
  countryId: string;
  gender: Gender;
  now?: Date;
}): LifeSnapshot {
  const now = input.now ?? new Date();
  const [y, m, d] = input.birthISO.split("-").map(Number);
  const birth = new Date(y, m - 1, d, 0, 0, 0, 0);
  const country = getCountry(input.countryId);
  const age = ageYears(birth, now);
  const deathAge = expectedDeathAge(age, country, input.gender);
  const remainingYears = deathAge - age;
  const surpassed = remainingYears <= 0;
  const remainingMs = Math.max(0, remainingYears * MS_YEAR);
  const livedMs = Math.max(0, now.getTime() - birth.getTime());
  const totalMs = livedMs + Math.max(remainingMs, 1.25 * MS_YEAR);
  const deathAt = new Date(now.getTime() + remainingMs);

  const hoursFloat = remainingMs / 3_600_000;
  const remainingHours = Math.floor(hoursFloat);
  const minuteFloat = (hoursFloat - remainingHours) * 60;
  const remainingMinutes = Math.floor(minuteFloat);
  const remainingSeconds = Math.floor((minuteFloat - remainingMinutes) * 60);

  return {
    now,
    birth,
    ageYears: age,
    deathAge,
    deathAt,
    remainingMs,
    livedMs,
    totalMs,
    remainingYears: remainingMs / MS_YEAR,
    remainingDays: remainingMs / MS_DAY,
    remainingWeeks: remainingMs / (7 * MS_DAY),
    remainingHours,
    remainingMinutes,
    remainingSeconds,
    livedRatio: livedMs / totalMs,
    surpassed,
    country,
  };
}

export function remainingCount(remainingYears: number, perYear: number) {
  return Math.max(0, remainingYears * perYear);
}
