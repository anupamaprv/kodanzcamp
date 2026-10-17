import { describe, it, expect } from "vitest";
import { searchCamps, priceFor, CAMPS } from "@/lib/camps";

describe("camp search", () => {
  it("sorts by distance ascending", () => {
    const r = searchCamps({ zip: "19709", sort: "distance" });
    expect(r.map((c) => c.miles)).toEqual([...r.map((c) => c.miles)].sort((a, b) => a - b));
  });
  it("sorts by cost ascending, unknown prices last", () => {
    const p = searchCamps({ zip: "19709", sort: "cost" }).map((c) => c.pricePerWeek ?? Infinity);
    expect(p).toEqual([...p].sort((a, b) => a - b));
  });
  it("filters by age", () => {
    expect(searchCamps({ zip: "19709", age: 15 }).every((c) => c.maxAge >= 15)).toBe(true);
  });
  it("hides half-day camps when asked", () => {
    expect(searchCamps({ zip: "19709", fullDayOnly: true }).every((c) => c.dayType === "full")).toBe(true);
  });
});

describe("pricing", () => {
  const camp = { ...CAMPS[0]!, pricePerWeek: 300, fullSummerPrice: 3510 };
  it("partial weeks = weekly price x weeks", () => expect(priceFor(camp, camp.weeks.slice(0, 2), false)).toBe(600));
  it("unknown price stays unknown", () => expect(priceFor({ ...camp, pricePerWeek: null }, [], false)).toBeNull());
});

describe("summer dates", () => {
  it("runs Jun 7 to the week of Aug 30 (ends Sep 3)", async () => {
    const { SUMMER_WEEKS } = await import("@/lib/camps");
    expect(SUMMER_WEEKS[0]).toBe("2027-06-07");
    expect(SUMMER_WEEKS.at(-1)).toBe("2027-08-30");
  });
});
