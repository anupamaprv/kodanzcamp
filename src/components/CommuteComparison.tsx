import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Car, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedPlaces } from "@/lib/family";
import { calculateCommute } from "@/lib/commute.functions";
import type { CommuteResult } from "@/lib/commute";
import type { Camp } from "@/lib/camps";

export function CommuteComparison({ camps, onRoute }: { camps: Camp[]; onRoute?: (result: CommuteResult | null) => void }) {
  const offices = useSavedPlaces(true);
  const calculate = useServerFn(calculateCommute);
  const [office, setOffice] = useState("");
  const [direction, setDirection] = useState<"dropoff" | "pickup">("dropoff");
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<CommuteResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sig = camps.map((c) => c.id).join("|");
  useEffect(() => { setSelected(camps.slice(0, 4).map((c) => c.id)); setResult(null); onRoute?.(null); }, [sig]);
  const clear = () => { setResult(null); setError(""); onRoute?.(null); };
  return <section className="space-y-3 border-t pt-4 text-sm">
    <h3 className="flex items-center gap-2 font-bold text-navy"><Car className="h-4 w-4 text-teal" /> Driving comparison</h3>
    <div className="flex flex-wrap gap-2">
      <Button variant={direction === "dropoff" ? "default" : "outline"} size="sm" onClick={() => { setDirection("dropoff"); clear(); }}>Drop-off</Button>
      <Button variant={direction === "pickup" ? "default" : "outline"} size="sm" onClick={() => { setDirection("pickup"); clear(); }}>Pick-up</Button>
      <select aria-label="Commute office" className="min-w-0 max-w-full rounded-md border bg-background p-2" value={office} onChange={(e) => { setOffice(e.target.value); clear(); }}>
        <option value="">{direction === "pickup" ? "Camp → home" : "Home → camp"}</option>
        {(offices.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
    </div>
    {camps.length > 1 && <ul className="space-y-2">{selected.map((id, i) => {
      const camp = camps.find((c) => c.id === id);
      return <li key={id} className="flex items-center gap-2"><span className="min-w-0 flex-1">{i + 1}. {camp?.name}</span>
        <Button variant="ghost" size="icon" aria-label={`Move ${camp?.name} earlier`} disabled={i === 0} onClick={() => { const next = [...selected]; const previous = next[i - 1]; if (!previous) return; next[i - 1] = id; next[i] = previous; setSelected(next); clear(); }}><ArrowUp /></Button>
        <Button variant="ghost" size="icon" aria-label={`Move ${camp?.name} later`} disabled={i === selected.length - 1} onClick={() => { const next = [...selected]; const after = next[i + 1]; if (!after) return; next[i + 1] = id; next[i] = after; setSelected(next); clear(); }}><ArrowDown /></Button>
      </li>;
    })}</ul>}
    {camps.length > 1 && <div className="space-y-2">{camps.map((c) => <label key={c.id} className="flex items-start gap-2"><input type="checkbox" checked={selected.includes(c.id)} disabled={!selected.includes(c.id) && selected.length >= 4} onChange={(e) => { setSelected(e.target.checked ? [...selected, c.id] : selected.filter((id) => id !== c.id)); clear(); }} />{c.name}</label>)}</div>}
    <Button disabled={busy || !selected.length} onClick={async () => {
      setBusy(true); setError(""); setResult(null); onRoute?.(null);
      try { const value = await calculate({ data: { campIds: selected, officeKey: office || undefined, direction } }); setResult(value); onRoute?.(value); }
      catch (e) { setError(e instanceof Error ? e.message : "Could not calculate this drive"); }
      finally { setBusy(false); }
    }}><Car />{busy ? "Calculating…" : "Calculate drive"}</Button>
    {error && <p role="alert" className="break-words text-destructive">{error}</p>}
    {result && <div className="space-y-2 border-l-2 border-teal pl-3">
      <p className="font-semibold text-navy">{[result.from, ...result.stops.filter((name, i) => i > 0 || name !== result.from), ...(result.to !== result.stops.at(-1) ? [result.to] : [])].join(" → ")}</p>
      <p className="text-lg font-bold text-teal">{(result.route.meters / 1609.344).toFixed(1)} road miles · {Math.round(result.route.seconds / 60)} min</p>
      {result.baseline && <p>Direct commute: {Math.round(result.baseline.seconds / 60)} min. Camp detour: {Math.max(0, Math.round((result.route.seconds - result.baseline.seconds) / 60))} extra min.</p>}
      <p className="text-xs text-muted-foreground">{result.approximateStart ? "Uses a ZIP center where no private address is saved. " : "Uses your private starting addresses. "}Traffic estimate when calculated; not a guaranteed arrival time. Recent results reused for 15 minutes.</p>
      <p className="text-xs text-muted-foreground">Google Maps</p>
    </div>}
  </section>;
}