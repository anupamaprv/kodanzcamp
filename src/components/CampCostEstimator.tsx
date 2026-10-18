import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Calculator, ChevronDown, RotateCcw, CalendarPlus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleDialog } from "@/components/ScheduleDialog";
import { CAMPS, SUMMER_WEEKS, weekLabel, type Camp } from "@/lib/camps";
import type { Activity, Favorite, Kid, Plan } from "@/lib/family";
import { summerCosts, type CostSelection } from "@/lib/camp-costs";

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export function CampCostEstimator({ kids, plans, favorites, activities }: { kids: Kid[]; plans: Plan[]; favorites: Favorite[]; activities: Activity[] }) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [rates, setRates] = useState<Record<string, number>>({});
  const [count, setCount] = useState(1);
  const [schedule, setSchedule] = useState<Camp | null>(null);
  const favoritesList = favorites.flatMap((f) => { const camp = CAMPS.find((c) => c.id === f.camp_id); return camp ? [camp] : []; });
  const options = CAMPS.filter((c) => favoritesList.some((f) => f.id === c.id) || plans.some((p) => p.camp_id === c.id));
  const selections: CostSelection[] = SUMMER_WEEKS.flatMap((week) => kids.flatMap((kid) => {
    const chosen = draft[`${kid.id}:${week}`];
    if (chosen !== undefined) return chosen ? [{ kidId: kid.id, week, campId: chosen }] : [];
    return plans.filter((p) => p.kid_id === kid.id && p.week === week).map((p) => ({ kidId: kid.id, week, campId: p.camp_id }));
  }));
  const costs = summerCosts(kids.map((k) => k.id), SUMMER_WEEKS, selections, CAMPS, rates);
  const hasDraft = Object.keys(draft).length > 0 || Object.keys(rates).length > 0;

  return <section id="camp-costs" className="space-y-6 scroll-mt-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-2xl font-bold text-navy"><Calculator className="h-5 w-5 text-teal" /> Camp costs</h2>
      <span className="rounded-full bg-sun-soft px-3 py-1 text-xs font-semibold text-navy">ESTIMATES · USD</span>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-lg font-bold text-navy">Compare favorites</h3>
      <label className="flex items-center gap-2 text-sm">Weeks per child <input aria-label="Comparison weeks" type="number" min={1} max={13} value={count} onChange={(e) => setCount(Math.min(13, Math.max(1, Number(e.target.value) || 1)))} className="w-16 rounded-md border bg-card p-2" /></label>
    </div>
    {favoritesList.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{favoritesList.map((camp) => <article key={camp.id} className="overflow-hidden rounded-lg border bg-card">
      <img src={camp.image} alt={camp.name} className="h-36 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div><Link to="/camps" search={{ camp: camp.id }} className="font-bold text-navy hover:underline">{camp.name}</Link><p className="text-xs text-muted-foreground">{camp.city}, {camp.state}{camp.synthetic ? " · Synthetic" : ""}</p></div>
        <p className="text-sm text-muted-foreground">Ages {camp.minAge}–{camp.maxAge}{camp.ageEstimated ? " (estimated)" : ""} · {camp.dayType === "unknown" ? "Day length unconfirmed" : `${camp.dayType}-day`}<br />{camp.hours ?? "Hours unconfirmed"}</p>
        <div className="flex items-end justify-between gap-2"><div><p className="text-xl font-bold text-teal">{money(rates[camp.id] ?? camp.pricePerWeek)}<span className="text-xs font-normal"> / week</span></p><p className="text-xs text-muted-foreground">{rates[camp.id] !== undefined ? "Your rate" : camp.priceEstimated ? "Estimated rate" : "Listed rate"}</p></div><p className="text-right text-sm font-semibold text-navy">{money((rates[camp.id] ?? camp.pricePerWeek) * count)}<br /><span className="text-xs font-normal text-muted-foreground">{count} {count === 1 ? "week" : "weeks"} / child</span></p></div>
        <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">Your weekly rate ($)<input aria-label={`Weekly rate for ${camp.name}`} type="number" min={0} step={1} placeholder={String(camp.pricePerWeek)} value={rates[camp.id] ?? ""} onChange={(e) => { const next = { ...rates }; if (e.target.value === "") delete next[camp.id]; else next[camp.id] = Math.max(0, Number(e.target.value)); setRates(next); }} className="w-24 rounded-md border bg-background p-2 text-foreground" /></label>
        <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" asChild><Link to="/camps" search={{ camp: camp.id }}><ExternalLink /> Details</Link></Button><Button size="sm" onClick={() => setSchedule(camp)}><CalendarPlus /> Plan weeks</Button></div>
      </div>
    </article>)}</div> : <p className="text-sm text-muted-foreground">No favorite camps yet.</p>}

    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6"><h3 className="text-xl font-bold text-navy">Family cost comparison</h3><Button variant="outline" size="sm" disabled={!hasDraft} onClick={() => { setDraft({}); setRates({}); }}><RotateCcw /> Reset to planner</Button></div>
    <p className="text-sm text-muted-foreground">{hasDraft ? "What-if estimate · your saved planner is unchanged." : "Based on your planned camp weeks."} Rates exclude unlisted registration, meals and extended-care fees; confirm prices and 2027 dates with providers.</p>
    {kids.length ? <>
      <div className="overflow-x-auto"><table aria-label="Family cost comparison" className="w-full min-w-[520px] border-collapse text-sm">
        <thead className="bg-teal-soft text-navy"><tr><th className="px-3 py-3 text-left">Week</th>{kids.map((kid) => <th key={kid.id} className="min-w-44 px-3 py-3 text-left">{kid.name}</th>)}<th className="px-3 py-3 text-right">Family</th></tr></thead>
        <tbody>{costs.rows.map((row) => <tr key={row.week} className="border-b"><th className="whitespace-nowrap px-3 py-3 text-left font-medium text-navy">{weekLabel(row.week)}</th>{row.children.map((cell) => {
          const key = `${cell.kidId}:${row.week}`;
          const chosen = selections.filter((s) => s.kidId === cell.kidId && s.week === row.week);
          const busy = activities.filter((a) => a.week === row.week && (!a.kid_id || a.kid_id === cell.kidId));
          return <td key={cell.kidId} className="px-3 py-3 align-top"><select aria-label={`${kids.find((k) => k.id === cell.kidId)?.name} camp for ${row.week}`} value={draft[key] ?? (chosen.length > 1 ? "__multiple" : chosen[0]?.campId ?? "")} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} className="w-full max-w-52 rounded-md border bg-card p-2 text-xs"><option value="">{busy.length ? "Personal activity / no camp" : "No camp"}</option>{chosen.length > 1 && <option value="__multiple" disabled>Multiple planned camps</option>}{options.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><p className="mt-1 font-semibold text-navy">{cell.unknown ? "Price unavailable" : chosen.length ? money(cell.total) : "—"}</p>{chosen.length > 1 && <p className="text-xs text-coral">Overlapping plans · both included</p>}{busy.length > 0 && <p className="text-xs text-lilac">{busy.map((a) => a.label).join(", ")}{chosen.length ? " · conflicts with camp" : ""}</p>}</td>;
        })}<td className="px-3 py-3 text-right font-bold text-teal">{money(row.total)}</td></tr>)}</tbody>
        <tfoot className="bg-teal-soft text-navy"><tr><th className="px-3 py-4 text-left">Summer total</th>{costs.children.map((c) => <td key={c.kidId} className="px-3 py-4 font-bold">{money(c.total)}</td>)}<td data-testid="family-cost-total" className="px-3 py-4 text-right text-2xl font-bold">{money(costs.total)}</td></tr></tfoot>
      </table></div>
      {costs.rows.some((r) => r.children.some((c) => c.unknown)) && <p className="text-sm text-coral">Total is partial: some planned camps have no available rate.</p>}
    </> : <p className="text-sm text-muted-foreground">Add a child to estimate weekly family costs.</p>}
    {schedule && <ScheduleDialog camp={schedule} onClose={() => setSchedule(null)} />}
  </section>;
}