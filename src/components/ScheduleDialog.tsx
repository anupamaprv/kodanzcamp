import { useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { buildIcs, priceFor, weekLabel, type Camp } from "@/lib/camps";

export function ScheduleDialog({ camp, onClose }: { camp: Camp; onClose: () => void }) {
  const [mode, setMode] = useState<"partial" | "full">("partial");
  const [weeks, setWeeks] = useState<string[]>([]);
  const chosen = mode === "full" ? camp.weeks : weeks;
  const total = priceFor(camp, weeks, mode === "full");

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
      <div role="dialog" aria-label={`Save ${camp.name} to calendar`} className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
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
            return (
              <button key={w} disabled={mode === "full"} onClick={() => toggle(w)} aria-pressed={on}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${on ? "border-teal bg-teal-soft font-semibold text-navy" : "hover:border-teal"}`}>
                {weekLabel(w)}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">{chosen.length} week{chosen.length === 1 ? "" : "s"} · estimated</p>
            <p className="font-display text-2xl font-bold text-navy">${total.toLocaleString()}</p>
            {mode === "full" && <p className="text-xs text-teal">Full-summer rate</p>}
          </div>
          <button onClick={download} disabled={!chosen.length}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-40">
            <CalendarPlus className="h-4 w-4" /> Add to calendar
          </button>
        </div>
      </div>
    </div>
  );
}
