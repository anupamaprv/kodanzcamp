import { useState } from "react";
import { CalendarPlus, CalendarCheck, Plane, Star, X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { useActivities, useFamilyMutations, useKids, usePlans } from "@/lib/family";
import { AuthPrompt } from "@/components/AuthPrompt";
import { buildIcs, CAMPS, priceFor, weekLabel, type Camp } from "@/lib/camps";
import { Button } from "@/components/ui/button";
import { friendsForCampWeek } from "@/lib/planner-sharing";
import { useSharedPlanners } from "@/lib/planner-sharing-data";

const campById = Object.fromEntries(CAMPS.map((c) => [c.id, c]));

export function ScheduleDialog({ camp, onClose }: { camp: Camp; onClose: () => void }) {
  const [mode, setMode] = useState<"partial" | "full">("partial");
  const [weeks, setWeeks] = useState<string[]>([]);
  const chosen = mode === "full" ? camp.weeks : weeks;
  const total = priceFor(camp, weeks, mode === "full");
  const { user } = useSession();
  const shared = useSharedPlanners(!!user);
  const kids = useKids(!!user);
  const plans = usePlans(!!user);
  const acts = useActivities(!!user);
  const { addPlans } = useFamilyMutations();
  const [kidIds, setKidIds] = useState<string[] | null>(null);
  const chosenKids = kidIds ?? (kids.data ?? []).map((k) => k.id);
  const [prompt, setPrompt] = useState(false);

  const addToPlanner = async () => {
    if (!user) return setPrompt(true);
    if (!chosenKids.length) return toast.error("Pick at least one child");
    await addPlans.mutateAsync(chosenKids.flatMap((kid_id) => chosen.map((week) => ({ kid_id, camp_id: camp.id, week }))));
    toast.success("Added to your summer planner");
    onClose();
  };

  const toggle = (w: string) =>
    setWeeks((cur) => (cur.includes(w) ? cur.filter((x) => x !== w) : [...cur, w].sort()));

  const download = () => {
    const blob = new Blob([buildIcs(camp, chosen)], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${camp.id}-summer.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-label={`Save ${camp.name} to calendar`} className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Save to calendar</p>
            <h2 className="mt-1 text-xl font-bold text-navy">{camp.name}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
          {(["partial", "full"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`rounded-xl py-2 text-sm font-semibold transition ${mode === m ? "bg-card text-navy shadow-soft" : "text-muted-foreground"}`}>
              {m === "partial" ? "Pick weeks" : "Full summer"}
            </button>
          ))}
        </div>

        <div className="mt-4 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
          {camp.weeks.map((w) => {
            const on = mode === "full" || weeks.includes(w);
            const friends = user ? friendsForCampWeek(shared.data ?? [], camp.id, w) : [];
            const kidName = (id: string | null) => (id ? (kids.data ?? []).find((k) => k.id === id)?.name : "Family");
            const booked = (plans.data ?? [])
              .filter((p) => p.week === w)
              .map((p) => ({
                key: p.id,
                text: p.camp_id === camp.id
                  ? `Booked for ${kidName(p.kid_id) ?? "child"}`
                  : `${kidName(p.kid_id) ?? "Child"}: ${campById[p.camp_id]?.name ?? "another camp"}`,
                same: p.camp_id === camp.id,
              }));
            const busy = (acts.data ?? [])
              .filter((a) => a.week === w)
              .map((a) => ({ key: a.id, text: `${kidName(a.kid_id) ?? "Child"}: ${a.label}` }));
            const hasAny = booked.length > 0 || busy.length > 0;
            return (
              <Button key={w} variant="outline" disabled={mode === "full"} onClick={() => toggle(w)} aria-pressed={on}
                className={`h-auto min-h-12 flex-col items-start gap-1 whitespace-normal rounded-xl px-3 py-2 text-left text-sm transition ${on ? "border-teal bg-teal-soft font-semibold text-navy" : "hover:border-teal"} hover:bg-teal-soft hover:text-navy`}>
                <span className="flex w-full items-center justify-between gap-1">
                  <span>{weekLabel(w)}</span>
                  {hasAny && <CalendarCheck aria-label="Already has plans in your planner" className="h-3.5 w-3.5 shrink-0 text-coral" />}
                </span>
                {booked.map((b) => <span key={b.key} className={`text-xs font-medium ${b.same ? "text-teal" : "text-coral"} min-w-0 break-words`}>{b.text}</span>)}
                {busy.map((b) => <span key={b.key} className="flex min-w-0 items-start gap-1 break-words text-xs font-medium text-lilac"><Plane aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />{b.text}</span>)}
                {friends.map((friend) => <span key={friend.id} className="flex max-w-full items-start gap-1 text-xs font-semibold text-teal"><Star aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0 fill-current" /><span className="min-w-0 break-words">{friend.name}</span></span>)}
              </Button>
            );
          })}
        </div>
        {camp.availability !== "confirmed" && <p className="mt-3 text-sm text-coral">Tentative plan only: {camp.availability === "assumed" ? "2027 offering assumed from your flyer" : "2027 dates not published"}. Confirm dates, age eligibility and price with the provider before booking.</p>}

        {user && kids.data && kids.data.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold">For</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {kids.data.map((k) => {
                const on = chosenKids.includes(k.id);
                return (
                  <button key={k.id} aria-pressed={on} onClick={() => setKidIds(on ? chosenKids.filter((x) => x !== k.id) : [...chosenKids, k.id])}
                    className={`rounded-full border px-3 py-1 text-sm font-semibold ${on ? "border-teal bg-teal text-accent-foreground" : "hover:border-teal"}`}>
                    {k.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {user && kids.data?.length === 0 && <p className="mt-4 text-xs text-muted-foreground">Add your kids in My summer to plan weeks for each one.</p>}

        <div className="mt-5 flex items-center justify-between border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">{chosen.length} week{chosen.length === 1 ? "" : "s"} · estimated</p>
            <p className="font-display text-2xl font-bold text-navy">{total != null ? `$${total.toLocaleString()}` : "Ask provider"}</p>
            {mode === "full" && <p className="text-xs text-teal">Weekly rate × selected weeks; no assumed discount</p>}
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={addToPlanner} disabled={!chosen.length || (!!user && !kids.data?.length)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-40">
              <CalendarCheck className="h-4 w-4" /> Add to my planner
            </button>
            <p className="max-w-44 text-center text-[11px] leading-snug text-muted-foreground">Just a plan — compare options and remove it anytime in My summer.</p>
            <button onClick={download} disabled={!chosen.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-navy disabled:opacity-40">
              <CalendarPlus className="h-4 w-4" /> Download to calendar
            </button>
          </div>
        </div>
      </div>
      {prompt && <AuthPrompt title="Plan your summer" onClose={() => setPrompt(false)} />}
    </div>
  );
}
