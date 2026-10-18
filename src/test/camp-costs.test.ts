import { describe, expect, it } from "vitest";
import { summerCosts } from "@/lib/camp-costs";

describe("family camp cost estimator", () => {
  const weeks = ["2027-06-14", "2027-06-21", "2027-07-05"];
  const prices = [310, 290, 275, 350, 350, 310];
  const camps = prices.map((pricePerWeek, i) => ({ id: String(i), pricePerWeek }));
  const choices = weeks.flatMap((week, i) => ["a", "b"].map((kidId, j) => ({ week, kidId, campId: String(i * 2 + j) })));
  it("matches the supplied example's weekly family totals and summer total", () => {
    const result = summerCosts(["a", "b"], weeks, choices, camps);
    expect(result.rows.map((r) => r.total)).toEqual([600, 625, 660]);
    expect(result.total).toBe(1885);
    expect(result.children.map((c) => c.total)).toEqual([935, 950]);
  });
  it("counts a camp separately for each child and week", () => {
    const selections = weeks.flatMap((week) => ["a", "b"].map((kidId) => ({ week, kidId, campId: "arts" })));
    expect(summerCosts(["a", "b"], weeks, selections, [{ id: "arts", pricePerWeek: 200 }]).total).toBe(1200);
  });
  it("applies user-entered rates without changing directory rates", () => {
    expect(summerCosts(["a"], weeks, choices, camps, { "0": 100 }).total).toBe(725);
    expect(camps[0]?.pricePerWeek).toBe(310);
  });
  it("keeps unscheduled weeks at zero and flags missing camp prices", () => {
    const result = summerCosts(["a"], weeks, [{ kidId: "a", week: weeks[0] ?? "", campId: "missing" }], camps);
    expect(result.total).toBe(0);
    expect(result.rows[0]?.children[0]?.unknown).toBe(true);
  });
});