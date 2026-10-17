import { SUMMER_WEEKS } from "@/lib/camps";
import type { Activity, Kid, Plan } from "@/lib/family";

export type SharedPlanner = { id: string; title: string; kids: Kid[]; plans: Plan[] };
export type PlannerInvitation = { id: string; title: string; kid_ids: string[]; token: string };

export function matchingKids(plan: Pick<Plan, "camp_id" | "week">, kids: Kid[], ownPlans: Plan[]) {
  return kids.filter((kid) => ownPlans.some((p) => p.kid_id === kid.id && p.camp_id === plan.camp_id && p.week === plan.week));
}

export function adoptablePlans(source: Plan[], target: Kid, weeks: string[], own: Plan[], activities: Activity[], camps: { id: string; minAge: number; maxAge: number; weeks: string[] }[]) {
  const seen = new Set<string>();
  return source.filter((p) => {
    const camp = camps.find((c) => c.id === p.camp_id);
    if (!weeks.includes(p.week) || !SUMMER_WEEKS.includes(p.week) || !camp || !camp.weeks.includes(p.week) || target.age < camp.minAge || target.age > camp.maxAge) return false;
    if (own.some((o) => o.kid_id === target.id && o.week === p.week) || activities.some((a) => a.week === p.week && (a.kid_id === null || a.kid_id === target.id)) || seen.has(p.week)) return false;
    seen.add(p.week);
    return true;
  }).map((p) => ({ kid_id: target.id, camp_id: p.camp_id, week: p.week }));
}

export function plannerInviteUrl(token: string, origin = "https://kodanzcamp.lovable.app") {
  const url = new URL("/planner", origin);
  url.searchParams.set("invite", token);
  return url.toString();
}