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
    expect(searchCamps({ zip: "19709", age: 15 }).every((c) => c.maxAge !== null && c.maxAge >= 15)).toBe(true);
  });
  it("hides half-day camps when asked", () => {
    expect(searchCamps({ zip: "19709", fullDayOnly: true }).every((c) => c.dayType === "full")).toBe(true);
  });
});

describe("pricing", () => {
  const first = CAMPS[0];
  if (!first) throw new Error("Directory empty");
  const camp = { ...first, pricePerWeek: 300 };
  it("partial weeks = weekly price x weeks", () => expect(priceFor(camp, camp.weeks.slice(0, 2), false)).toBe(600));
  it("does not invent a full-summer discount", () => expect(priceFor({ ...camp, weeks: ["2027-06-07", "2027-06-14"] }, [], true)).toBe(600));
});

describe("directory trust", () => {
  it("preserves the Bayberry flyer assumption and concrete price and ages", () => {
    const camp = CAMPS.find((c) => c.id === "summer-art-camp-july-middletown");
    expect(camp?.availability).toBe("assumed");
    expect(camp?.pricePerWeek).toBe(100);
    expect([camp?.minAge, camp?.maxAge]).toEqual([5, 15]);
    expect(camp?.offeredWeeks).toEqual([]);
  });
  it("labels Shilpi's ages and price as estimates", () => {
    const camp = CAMPS.find((c) => c.id === "shilpi-fine-arts-summer-art-camp-middletown");
    expect(camp?.dayType).toBe("half");
    expect(camp?.hours).toBe("9am–1pm, Monday–Friday");
    expect(camp?.ageEstimated).toBe(true);
    expect(camp?.priceEstimated).toBe(true);
  });
  it("shows YMCA, karate, Tumble Kids and Brilliant Little Minds for 19709 age 7", () => {
    const ids = searchCamps({ zip: "19709", age: 7 }).map((c) => c.id);
    for (const id of ["camp-silver-lake-middletown", "frank-family-karate-summer-camp-middletown", "tumble-kids-summer-camp-middletown", "brilliant-little-minds-bunker-hill", "brilliant-little-minds-odessa"]) expect(ids).toContain(id);
  });
  it("never confirms all thirteen weeks through a missing-date default", () => {
    const camp = CAMPS.find((c) => c.id === "spark-summer-camp-middletown-middletown");
    expect(camp?.availability).toBe("pending");
    expect(camp?.offeredWeeks).toEqual([]);
  });
});

describe("summer dates", () => {
  it("runs Jun 7 to the week of Aug 30 (ends Sep 3)", async () => {
    const { SUMMER_WEEKS } = await import("@/lib/camps");
    expect(SUMMER_WEEKS[0]).toBe("2027-06-07");
    expect(SUMMER_WEEKS.at(-1)).toBe("2027-08-30");
  });
});
