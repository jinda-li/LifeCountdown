import { describe, expect, it } from "vitest";
import { formatZhYMD } from "./format";

describe("formatZhYMD", () => {
  it("renders a Chinese calendar date", () => {
    expect(formatZhYMD("1996-08-18")).toBe("1996年8月18日");
  });

  it("returns empty for incomplete values", () => {
    expect(formatZhYMD("")).toBe("");
    expect(formatZhYMD("1996-00-01")).toBe("");
  });
});
