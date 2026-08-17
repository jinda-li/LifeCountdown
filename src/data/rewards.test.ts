import { describe, expect, it } from "vitest";
import { SKINS, THEMES } from "./rewards";

describe("unlockable chrome", () => {
  it("keeps countdown skin ids in sync with data-skin styles", () => {
    expect(SKINS.map((s) => s.id)).toEqual([
      "digits",
      "progress",
      "battery",
      "clock",
      "dots",
      "ring",
    ]);
  });

  it("keeps appearance theme ids in sync with data-theme styles", () => {
    expect(THEMES.map((t) => t.id)).toEqual(["dawn", "paper", "night"]);
  });
});
