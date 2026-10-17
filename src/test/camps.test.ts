import { describe, it, expect } from "vitest";
import { searchCamps, priceFor, CAMPS } from "@/lib/camps";

describe("camp search", () => {
  it("sorts by distance ascending", () => {
    const r = searchCamps({ zip: "19709", sort: "distance" });
    expect(r.map((c) => c.miles)).toEqual([...r.map((c) => c.miles)].sort((a, b) => a - b));
  });
  it("sorts by cost ascending", () => {
    const r = searchCamps({ zip: "19709", sort: "cost" });
    expect(r[0].pricePerWeek).toBe(240);
  });
  it("filters by age", () => {
    expect(searchCamps({ zip: "19709", age: 15 }).every((c) => c.maxAge >= 15)).toBe(true);
  });
});

describe("pricing", () => {
  const camp = CAMPS[0]!;
  it("partial weeks = weekly price x weeks", () => expect(priceFor(camp, camp.weeks.slice(0, 2), false)).toBe(620));
  it("full summer is 10% off all weeks", () => expect(priceFor(camp, [], true)).toBe(3069));
});
