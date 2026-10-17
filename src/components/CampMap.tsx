import { Home } from "lucide-react";
import type { CampResult } from "@/lib/camps";

const PIN = ["text-coral", "text-teal", "text-lilac", "text-sun", "text-navy"];

/** Illustrated commute map: pins placed by offset (miles) from home. */
export function CampMap({ camps, radius, selected, onSelect }: {
  camps: CampResult[]; radius: number; selected?: string; onSelect: (id: string) => void;
}) {
  const scale = 45 / Math.max(radius, 10); // % per mile
  const pos = (v: number) => 50 + v * scale;
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border bg-map-land shadow-soft">
      <svg viewBox="0 0 100 75" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M0 10 Q20 5 30 18 T60 12 L60 0 L0 0Z" className="fill-map-park" />
        <path d="M70 75 Q75 55 90 50 T100 40 L100 75Z" className="fill-map-water" />
        <ellipse cx="78" cy="20" rx="10" ry="5" className="fill-map-water" />
        <ellipse cx="18" cy="55" rx="12" ry="8" className="fill-map-park" />
        <path d="M45 0 Q50 30 40 75" className="stroke-map-road" strokeWidth="1.6" fill="none" />
        <path d="M0 45 Q50 35 100 30" className="stroke-map-road" strokeWidth="1.2" fill="none" />
      </svg>
      {[1, 0.6].map((r) => (
        <div key={r} className="absolute rounded-full border border-teal/40 bg-teal/5"
          style={{ left: "50%", top: "50%", width: `${r * 60}%`, aspectRatio: "1", transform: "translate(-50%,-50%)" }} />
      ))}
      <div className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card text-navy shadow-pin" style={{ left: "50%", top: "50%" }}>
        <Home className="h-5 w-5" />
      </div>
      {camps.map((c, i) => (
        <button key={c.id} onClick={() => onSelect(c.id)}
          className={`absolute flex -translate-x-1/2 -translate-y-full items-center gap-1.5 rounded-xl bg-card px-2 py-1 text-left shadow-pin transition hover:z-20 hover:scale-105 ${selected === c.id ? "z-10 ring-2 ring-teal" : ""}`}
          style={{ left: `${Math.min(95, Math.max(5, pos(c.x)))}%`, top: `${Math.min(95, Math.max(8, pos(-c.y)))}%` }}>
          <svg viewBox="0 0 24 24" className={`h-5 w-5 ${PIN[i % PIN.length]}`}><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" /></svg>
          <span className="leading-tight">
            <span className="block text-xs font-bold text-navy">${c.pricePerWeek}</span>
            <span className="block text-[10px] text-muted-foreground">{c.minutes} min</span>
          </span>
        </button>
      ))}
    </div>
  );
}
