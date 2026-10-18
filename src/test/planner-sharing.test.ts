import { describe, expect, it } from "vitest";
import { adoptablePlans, friendsForCampWeek, matchingKids, plannerInviteUrl } from "@/lib/planner-sharing";
import { buildPlannerIcs, buildPlannerPdf, calendarRows } from "@/lib/planner-export";
import { CAMPS, buildIcs } from "@/lib/camps";

const kid = { id: "one", name: "Sam", age: 8 };
const friend = { id: "two", name: "Alex", age: 8 };
const source = [{ id: "p", kid_id: friend.id, camp_id: "camp", week: "2027-06-07" }];
const camp = { id: "camp", minAge: 5, maxAge: 12, weeks: ["2027-06-07"] };
const readBlob = (blob: Blob) => new Promise<ArrayBuffer>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => reader.result instanceof ArrayBuffer ? resolve(reader.result) : reject(new Error("Invalid PDF bytes"));
  reader.onerror = () => reject(reader.error);
  reader.readAsArrayBuffer(blob);
});
describe("Private summer coordination", () => {
  it("identifies a friend only for the same camp and week in accepted planners", () => {
    const accepted = [{ id: "share", title: "Summer", kids: [friend], plans: source }];
    expect(friendsForCampWeek(accepted, "camp", "2027-06-07")).toEqual([friend]);
    expect(friendsForCampWeek(accepted, "other", "2027-06-07")).toEqual([]);
    expect(friendsForCampWeek(accepted, "camp", "2027-06-14")).toEqual([]);
    expect(friendsForCampWeek([], "camp", "2027-06-07")).toEqual([]);
  });
  it("shows each matching child once across repeated invitations and includes multiple friends", () => {
    const other = { id: "three", name: "Taylor", age: 9 };
    const accepted = { id: "share", title: "Summer", kids: [friend, other], plans: [...source, { id: "q", kid_id: other.id, camp_id: "camp", week: "2027-06-07" }] };
    expect(friendsForCampWeek([accepted, { ...accepted, id: "duplicate" }], "camp", "2027-06-07")).toEqual([friend, other]);
  });
  it("includes an existing camp website in each calendar event", () => {
    const c = CAMPS.find((camp) => camp.website);
    if (!c?.website) throw new Error("Camp website fixture missing");
    const ics = buildPlannerIcs([kid], [{ id: "p", kid_id: kid.id, camp_id: c.id, week: "2027-06-07" }], []).replace(/\r\n /g, "");
    expect(ics).toContain(`URL:${c.website}`);
    expect(ics).toContain(`Website: ${c.website.replace(/,/g, "\\,").replace(/;/g, "\\;")}`);
    expect(buildIcs(c, ["2027-06-07"])).toContain(`URL:${c.website}`);
  });
  it("does not attach a website to personal activity events", () => {
    expect(buildPlannerIcs([kid], [], [{ id: "a", kid_id: kid.id, week: "2027-06-07", label: "Trip" }])).not.toContain("URL:");
  });
  it("puts two children together only when side-by-side is selected", async () => {
    const { PDFDocument } = await import("pdf-lib");
    const together = await buildPlannerPdf([kid, friend], [], [], "side-by-side");
    const separate = await buildPlannerPdf([kid, friend], [], [], "separate");
    expect((await PDFDocument.load(await readBlob(together))).getPageCount()).toBe(1);
    expect((await PDFDocument.load(await readBlob(separate))).getPageCount()).toBe(2);
  });
  it("keeps a single child's PDF on one page regardless of layout", async () => {
    const { PDFDocument } = await import("pdf-lib");
    const blob = await buildPlannerPdf([kid], [], [], "side-by-side");
    expect((await PDFDocument.load(await readBlob(blob))).getPageCount()).toBe(1);
  });
  it("matches only the same camp in the same week", () => {
    expect(matchingKids(source[0] ?? { camp_id: "camp", week: "" }, [kid], [{ ...source[0], id: "mine", kid_id: kid.id, camp_id: "camp", week: "2027-06-07" }])).toEqual([kid]);
    expect(matchingKids({ camp_id: "camp", week: "2027-06-14" }, [kid], [{ id: "mine", kid_id: kid.id, camp_id: "camp", week: "2027-06-07" }])).toEqual([]);
  });
  it("copies selected weeks into the recipient child, not the friend's child", () => {
    expect(adoptablePlans(source, kid, ["2027-06-07"], [], [], [camp])).toEqual([{ kid_id: "one", camp_id: "camp", week: "2027-06-07" }]);
    expect(source[0]?.kid_id).toBe("two");
    expect(adoptablePlans(source, kid, [], [], [], [camp])).toEqual([]);
  });
  it("matches the recipient's copied plan back to the friend without changing the friend's planner", () => {
    const jane = { id: "jane", name: "Jane", age: 8 };
    const mmm = { id: "mmm", name: "MMM", age: 7 };
    const friendPlans = [{ id: "friend-plan", kid_id: mmm.id, camp_id: "wize", week: "2027-07-12" }];
    const original = structuredClone(friendPlans);
    const copied = adoptablePlans(friendPlans, jane, ["2027-07-12"], [], [], [{ id: "wize", minAge: 5, maxAge: 12, weeks: ["2027-07-12"] }]);
    expect(copied).toEqual([{ kid_id: "jane", camp_id: "wize", week: "2027-07-12" }]);
    const ownPlan = copied[0];
    if (!ownPlan) throw new Error("Expected Jane's copied plan");
    expect(friendsForCampWeek([{ id: "share", title: "M-summer-planner", kids: [mmm], plans: friendPlans }], ownPlan.camp_id, ownPlan.week)).toEqual([mmm]);
    expect(friendPlans).toEqual(original);
  });
  it("preserves occupied weeks and family activities", () => {
    expect(adoptablePlans(source, kid, ["2027-06-07"], [{ id: "other", kid_id: kid.id, camp_id: "other", week: "2027-06-07" }], [], [camp])).toEqual([]);
    expect(adoptablePlans(source, kid, ["2027-06-07"], [], [{ id: "trip", kid_id: null, week: "2027-06-07", label: "Trip" }], [camp])).toEqual([]);
  });
  it("does not copy age-ineligible or unavailable camps", () => {
    expect(adoptablePlans(source, { ...kid, age: 3 }, ["2027-06-07"], [], [], [camp])).toEqual([]);
    expect(adoptablePlans(source, kid, ["2027-06-07"], [], [], [{ ...camp, weeks: [] }])).toEqual([]);
  });
  it("invitation links contain only a token, never family data", () => {
    const url = new URL(plannerInviteUrl("invite-token"));
    expect(url.pathname).toBe("/planner");
    expect([...url.searchParams.entries()]).toEqual([["invite", "invite-token"]]);
  });
  it("exports all 13 weeks for only selected children", () => {
    const rows = calendarRows([kid], [], [{ id: "trip", kid_id: null, week: "2027-08-02", label: "Trip" }]);
    expect(rows).toHaveLength(13);
    expect(rows[0]?.week).toBe("2027-06-07");
    expect(rows[12]?.week).toBe("2027-08-30");
    expect(rows.filter((r) => r.activities.length)).toHaveLength(1);
  });
  it("exports selected-child camps and activities with exclusive Saturday ends", () => {
    const c = CAMPS[0];
    if (!c) throw new Error("Camp fixture missing");
    const ics = buildPlannerIcs([kid], [{ id: "p", kid_id: kid.id, camp_id: c.id, week: "2027-08-30" }, { id: "q", kid_id: friend.id, camp_id: c.id, week: "2027-06-07" }], [{ id: "a", kid_id: null, week: "2027-08-02", label: "Trip, family" }]);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("DTEND;VALUE=DATE:20270904");
    expect(ics).toContain("SUMMARY:Sam: Trip\\, family");
    expect(ics).not.toContain("Alex:");
  });
});