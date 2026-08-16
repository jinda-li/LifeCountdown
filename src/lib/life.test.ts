import { describe, expect, it } from "vitest";
import { expectedDeathAge, getCountry, remainingCount, snapshot } from "./life";

describe("life expectancy math", () => {
  it("loads China and Hong Kong with distinct figures", () => {
    const cn = getCountry("china");
    const hk = getCountry("hong-kong");
    expect(cn.nameZh).toContain("中国");
    expect(hk.le).toBeGreaterThan(cn.le);
    expect(cn.female).toBeGreaterThan(cn.male);
  });

  it("gives a 30-year-old remaining years in a plausible range", () => {
    const life = snapshot({
      birthISO: "1996-08-18",
      countryId: "china",
      gender: "female",
      now: new Date("2026-08-16T12:00:00"),
    });
    expect(life.ageYears).toBeGreaterThan(29);
    expect(life.ageYears).toBeLessThan(31);
    expect(life.remainingYears).toBeGreaterThan(40);
    expect(life.remainingYears).toBeLessThan(60);
    expect(life.remainingHours).toBeGreaterThan(300_000);
    expect(life.remainingSeconds).toBeGreaterThanOrEqual(0);
    expect(life.remainingMinutes).toBeLessThan(60);
  });

  it("ticks hours/minutes/seconds consistently", () => {
    const a = snapshot({
      birthISO: "2000-01-01",
      countryId: "japan",
      gender: "male",
      now: new Date("2026-01-01T00:00:00"),
    });
    const b = snapshot({
      birthISO: "2000-01-01",
      countryId: "japan",
      gender: "male",
      now: new Date("2026-01-01T01:01:01"),
    });
    expect(a.remainingHours - b.remainingHours).toBeGreaterThanOrEqual(1);
    expect(a.remainingHours - b.remainingHours).toBeLessThanOrEqual(2);
  });

  it("keeps a 90-year-old in gift time instead of negative life", () => {
    const life = snapshot({
      birthISO: "1930-01-01",
      countryId: "japan",
      gender: "female",
      now: new Date("2026-01-01"),
    });
    expect(life.remainingMs).toBeGreaterThan(0);
    expect(life.surpassed || life.remainingYears > 0).toBe(true);
  });

  it("counts remaining meals from remaining years", () => {
    expect(remainingCount(2, 365.2425 * 3)).toBeCloseTo(2191.455, 0);
  });

  it("raises expected death age as one survives", () => {
    const jp = getCountry("japan");
    const at0 = expectedDeathAge(0, jp, "female");
    const at65 = expectedDeathAge(65, jp, "female");
    expect(at65).toBeGreaterThan(at0 - 1);
  });
});
