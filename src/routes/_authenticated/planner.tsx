import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, LogOut, Plane, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { DrivingZone } from "@/components/DrivingZone";
import { CAMPS, SUMMER_WEEKS, weekLabel } from "@/lib/camps";
import { useActivities, useFamilyMutations, useFavorites, useKids, usePlans } from "@/lib/family";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "My summer planner — Kodanz" },
      { name: "description", content: "Your family's summer calendar, kids and favorite camps." },
      { property: "og:title", content: "My summer planner — Kodanz" },
      { property: "og:description", content: "Every child. Every week." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planner,
});

const CHIP = ["bg-teal-soft", "bg-sun-soft", "bg-coral-soft", "bg-secondary", "bg-muted"];
const campById = Object.fromEntries(CAMPS.map((c) => [c.id, c]));

function Planner() {
  const kids = useKids(true);
  const plans = usePlans(true);
  const favs = useFavorites(true);
  const acts = useActivities(true);
  const [actLabel, setActLabel] = useState("");
  const [actWeek, setActWeek] = useState(SUMMER_WEEKS[0]!);
  const [actWho, setActWho] = useState("family");
  const m = useFamilyMutations();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("8");

  const addKid = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n || n.length > 40) { toast.error("Enter a name (up to 40 characters)"); return; }
    await m.addKid.mutateAsync({ name: n, age: Number(age) });
    setName("");
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const kidList = kids.data ?? [];
  const planList = plans.data ?? [];
  const actList = acts.data ?? [];
  const actsFor = (kidId: string, w: string) => actList.filter((a) => a.week === w && (a.kid_id === null || a.kid_id === kidId));
  const openWeeks = (kidId: string) =>
    SUMMER_WEEKS.filter((w) => !planList.some((p) => p.kid_id === kidId && p.week === w) && actsFor(kidId, w).length === 0).length;

  const addActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = actLabel.trim();
    if (!label || label.length > 60) { toast.error("Describe the activity (up to 60 characters)"); return; }
    await m.addActivity.mutateAsync([{ kid_id: actWho === "family" ? null : actWho, week: actWeek, label }]);
    setActLabel("");
    toast.success("Added to your calendar");
  };

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/" className="rounded-full border bg-card px-4 py-2 text-sm font-semibold text-navy hover:bg-muted">Find camps</Link>
          <button onClick={signOut} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-navy"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 pb-16">
        <section>
          <p className="eyebrow">Family summer planner · Summer 2027</p>
          <h1 className="mt-1 text-3xl font-bold text-navy md:text-4xl">One summer. <span className="text-teal">Every child. Every week.</span></h1>

          {kidList.length === 0 ? (
            <p className="mt-6 rounded-3xl border bg-card p-6 text-muted-foreground">Add your kids below to start filling in their weeks.</p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-3xl border bg-card shadow-soft">
              <table className="w-full min-w-[1100px] border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="sticky left-0 bg-card px-4 py-3 text-left font-display text-xs uppercase text-muted-foreground">Child</th>
                    {SUMMER_WEEKS.map((w) => <th key={w} className="px-2 py-3 text-left font-display text-xs font-semibold text-muted-foreground">{weekLabel(w).split(" – ")[0]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {kidList.map((k, ki) => (
                    <tr key={k.id} className="border-b last:border-0">
                      <td className="sticky left-0 bg-card px-4 py-3"><p className="font-semibold text-navy">{k.name}</p><p className="text-xs text-muted-foreground">Age {k.age} · {openWeeks(k.id)} open</p></td>
                      {SUMMER_WEEKS.map((w) => {
                        const cell = planList.filter((p) => p.kid_id === k.id && p.week === w);
                        const busy = actsFor(k.id, w);
                        return (
                          <td key={w} className={`h-16 px-1 py-1 align-top ${busy.length ? "bg-lilac-soft/60" : ""}`}>
                            <div className="space-y-1">
                              {busy.map((a) => (
                                <div key={a.id} className="flex items-start justify-between gap-1 rounded-lg border border-dashed border-lilac bg-lilac-soft px-2 py-1 text-xs font-semibold text-lilac">
                                  <span className="line-clamp-2"><Plane className="mr-0.5 inline h-3 w-3" />{a.label}</span>
                                  <button onClick={() => m.removeActivity.mutate(a.id)} aria-label="Remove activity" className="opacity-50 hover:opacity-100"><X className="h-3 w-3" /></button>
                                </div>
                              ))}
                              {cell.map((p) => (
                                <div key={p.id} className={`group flex items-start justify-between gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-navy ${CHIP[ki % CHIP.length]}`}>
                                  <span className="line-clamp-2">{campById[p.camp_id]?.name ?? p.camp_id}</span>
                                  <button onClick={() => m.removePlan.mutate(p.id)} aria-label="Remove week" className="opacity-50 hover:opacity-100"><X className="h-3 w-3" /></button>
                                </div>
                              ))}
                              {(cell.length > 1 || (cell.length > 0 && busy.length > 0)) && <p className="text-[10px] font-semibold text-destructive">Conflict</p>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-teal-soft" /> Camp (planned)</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-dashed border-lilac bg-lilac-soft" /> Personal activity — no camp needed</span>
          </div>
          {kidList.length > 0 && (
            <form onSubmit={addActivity} className="mt-4 flex flex-wrap items-end gap-2 rounded-3xl border border-dashed border-lilac bg-lilac-soft/50 p-4">
              <div className="flex items-center gap-2 font-semibold text-lilac"><Plane className="h-4 w-4" /> Add a personal activity</div>
              <input value={actLabel} onChange={(e) => setActLabel(e.target.value)} maxLength={60} placeholder="e.g. Family trip" className="min-w-0 flex-1 rounded-xl border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              <select value={actWeek} onChange={(e) => setActWeek(e.target.value)} aria-label="Week" className="rounded-xl border bg-card px-2 py-2">
                {SUMMER_WEEKS.map((w) => <option key={w} value={w}>Week of {weekLabel(w)}</option>)}
              </select>
              <select value={actWho} onChange={(e) => setActWho(e.target.value)} aria-label="Who" className="rounded-xl border bg-card px-2 py-2">
                <option value="family">Whole family</option>
                {kidList.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              <button className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add</button>
            </form>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Planned, not booked. Use the calendar icon on any camp to add weeks here. Registration happens with the provider.</p>
        </section>

        <DrivingZone kids={kidList} plans={planList} favorites={favs.data ?? []} />

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-card p-6">
            <h2 className="text-xl font-bold text-navy">Your kids</h2>
            <ul className="mt-4 space-y-2">
              {kidList.map((k) => (
                <li key={k.id} className="flex items-center justify-between rounded-xl border px-3 py-2">
                  <span><span className="font-semibold text-navy">{k.name}</span> <span className="text-sm text-muted-foreground">· Age {k.age}</span></span>
                  <button onClick={() => confirm(`Remove ${k.name} and their planned weeks?`) && m.removeKid.mutate(k.id)} aria-label={`Remove ${k.name}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
            <form onSubmit={addKid} className="mt-4 flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Child's name" className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              <select value={age} onChange={(e) => setAge(e.target.value)} aria-label="Age" className="rounded-xl border bg-background px-2 py-2">
                {Array.from({ length: 15 }, (_, i) => i + 3).map((a) => <option key={a}>{a}</option>)}
              </select>
              <button className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add</button>
            </form>
          </div>

          <div className="rounded-3xl border bg-card p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-navy"><Heart className="h-5 w-5 fill-current text-coral" /> Favorites</h2>
            {favs.data?.length ? (
              <ul className="mt-4 space-y-2">
                {favs.data.map((f) => {
                  const c = campById[f.camp_id];
                  const who = kidList.filter((k) => f.kid_ids.includes(k.id)).map((k) => k.name);
                  return (
                    <li key={f.camp_id} className="flex items-center justify-between rounded-xl border px-3 py-2">
                      <div>
                        <p className="font-semibold text-navy">{c?.name ?? f.camp_id}</p>
                        <p className="text-xs text-muted-foreground">{who.length ? `For ${who.join(" & ")}` : "Not assigned to a child"} · ${c?.pricePerWeek}/week</p>
                      </div>
                      <button onClick={() => m.removeFavorite.mutate(f.camp_id)} aria-label="Remove favorite" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Tap the heart on any camp to save it here.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
