import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { geocodeZip } from "@/lib/geocode.functions";
import { CalendarPlus, List, Map as MapIcon, MapPin, Clock, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { Logo } from "@/components/Logo";
import { CampMap } from "@/components/CampMap";
import { ScheduleDialog } from "@/components/ScheduleDialog";
import { FavoriteButton } from "@/components/FavoriteButton";
import { AccountLink } from "@/components/AccountLink";
import { searchCamps, type CampResult } from "@/lib/camps";

const schema = z.object({
  zip: z.string().catch("19709"),
  age: z.coerce.number().optional().catch(undefined),
  interests: z.string().catch(""),
  view: z.enum(["list", "map"]).catch("list"),
  sort: z.enum(["distance", "cost"]).catch("distance"),
  radius: z.coerce.number().catch(20),
  fullDay: z.coerce.boolean().catch(false),
});

export const Route = createFileRoute("/camps")({
  validateSearch: schema,
  head: () => ({
    meta: [
      { title: "Summer camps near you — Kodanz" },
      { name: "description", content: "Browse matched summer camps sorted by distance and cost, on a list or map." },
      { property: "og:title", content: "Summer camps near you — Kodanz" },
      { property: "og:description", content: "Compare camps by distance, drive time and weekly cost." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampsPage,
});

function CampsPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/camps" });
  const interests = s.interests ? s.interests.split(",").filter(Boolean) : [];
  const geo = useQuery({
    queryKey: ["geocode", s.zip],
    queryFn: () => geocodeZip({ data: { zip: s.zip } }),
    enabled: /^\d{5}$/.test(s.zip),
    staleTime: Infinity,
  });
  const center = geo.data?.ok ? { lat: geo.data.lat, lng: geo.data.lng } : undefined;
  const camps = useMemo(
    () => searchCamps({ zip: s.zip, age: s.age, interests, radius: s.radius, sort: s.sort, center, fullDayOnly: s.fullDay }),
    [s.zip, s.age, s.interests, s.radius, s.sort, s.fullDay, center?.lat, center?.lng],
  );
  const [selected, setSelected] = useState<string>();
  const [saving, setSaving] = useState<CampResult>();
  const set = (patch: Partial<typeof s>) => navigate({ search: (prev) => ({ ...prev, ...patch }) });
  const active = camps.find((c) => c.id === selected) ?? camps[0];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-4">
          <Logo />
          <Link to="/" className="ml-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy"><ArrowLeft className="h-4 w-4" /> New search</Link>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-teal-soft px-3 py-1 font-semibold text-navy"><MapPin className="mr-1 inline h-3.5 w-3.5" />{s.zip}</span>
            {s.age && <span className="rounded-full bg-sun-soft px-3 py-1 font-semibold text-navy">Age {s.age}</span>}
            {interests.map((i) => <span key={i} className="rounded-full bg-coral-soft px-3 py-1 font-semibold text-navy">{i}</span>)}
            <AccountLink />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Matched options</p>
            <h1 className="text-3xl font-bold text-navy">{camps.length} camps within {s.radius} mi</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Segment value={String(s.radius)} options={[["5", "5 mi"], ["10", "10 mi"], ["20", "20 mi"], ["30", "30 mi"]]} onChange={(v) => set({ radius: Number(v) })} />
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border bg-card px-3 py-1.5 text-sm font-semibold text-navy">
              <input type="checkbox" className="h-4 w-4 accent-teal" checked={s.fullDay} onChange={(e) => set({ fullDay: e.target.checked })} />
              Hide half-day camps
            </label>
            <Segment value={s.sort} options={[["distance", "Nearest"], ["cost", "Lowest cost"]]} onChange={(v) => set({ sort: v as "distance" | "cost" })} />
            <Segment value={s.view} options={[["list", <List key="l" className="h-4 w-4" />], ["map", <MapIcon key="m" className="h-4 w-4" />]]} onChange={(v) => set({ view: v as "list" | "map" })} labels={["List view", "Map view"]} />
          </div>
        </div>

        {camps.length === 0 ? (
          <div className="mt-10 rounded-3xl border bg-card p-10 text-center">
            <p className="font-semibold text-navy">No camps match yet.</p>
            <p className="text-sm text-muted-foreground">Try a bigger radius or fewer interests.</p>
          </div>
        ) : s.view === "list" ? (
          <div className="mt-6 grid gap-4">
            {camps.map((c) => <CampCard key={c.id} camp={c} onSave={() => setSaving(c)} />)}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {center ? (
              <CampMap camps={camps} radius={s.radius} center={center} selected={active?.id} onSelect={setSelected} />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border bg-card text-sm text-muted-foreground">
                {geo.data && !geo.data.ok ? geo.data.error : "Loading map…"}
              </div>
            )}
            <div className="space-y-4">
              {active && <CampCard camp={active} onSave={() => setSaving(active)} compact />}
              <p className="text-xs text-muted-foreground">Commute estimates are approximate; exact routes depend on the starting address.</p>
            </div>
          </div>
        )}
      </main>
      {saving && <ScheduleDialog camp={saving} onClose={() => setSaving(undefined)} />}
    </div>
  );
}

function Segment({ value, options, onChange, labels }: {
  value: string; options: [string, React.ReactNode][]; onChange: (v: string) => void; labels?: string[];
}) {
  return (
    <div className="flex rounded-xl border bg-card p-1">
      {options.map(([v, label], i) => (
        <button key={v} onClick={() => onChange(v)} aria-label={labels?.[i]} aria-pressed={value === v}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${value === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-navy"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

function CampCard({ camp, onSave, compact }: { camp: CampResult; onSave: () => void; compact?: boolean }) {
  return (
    <article className={`flex gap-4 rounded-3xl border bg-card p-4 shadow-soft ${compact ? "flex-col" : "flex-col sm:flex-row"}`}>
      <img src={camp.image} alt={camp.name} loading="lazy" width={944} height={704}
        className={`rounded-2xl object-cover ${compact ? "aspect-video w-full" : "aspect-video w-full sm:aspect-[4/3] sm:w-52"}`} />
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy">{camp.name}</h2>
            <p className="text-sm text-muted-foreground">{camp.provider} · Ages {camp.minAge} – {camp.maxAge}</p>
            <p className="text-xs text-muted-foreground">{camp.address}</p>
            {camp.note && <p className="mt-1 text-xs font-semibold text-coral">{camp.note}</p>}
          </div>
          <div className="flex gap-2">
          <FavoriteButton camp={camp} />
          <button onClick={onSave} aria-label={`Save ${camp.name} to calendar`}
            className="shrink-0 rounded-xl border p-2 text-teal transition hover:bg-teal-soft">
            <CalendarPlus className="h-5 w-5" />
          </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span><MapPin className="mr-1 inline h-4 w-4 text-teal" />{camp.miles} mi · {camp.minutes} min</span>
          {camp.hours && <span><Clock className="mr-1 inline h-4 w-4 text-teal" />{camp.hours}</span>}
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${camp.dayType === "full" ? "bg-teal-soft text-navy" : "bg-sun-soft text-navy"}`}>{camp.dayType === "full" ? "Full day" : "Half day"}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {camp.interests.map((i) => <span key={i} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">{i}</span>)}
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
          {camp.pricePerWeek != null ? (
            <p><span className="font-display text-2xl font-bold text-navy">${camp.pricePerWeek}</span><span className="text-sm text-muted-foreground"> / week</span></p>
          ) : (
            <p className="font-semibold text-navy">Price: contact provider</p>
          )}
          <div className="text-right text-sm text-muted-foreground">
            {camp.fullSummerPrice != null && <p>Full summer est.: <span className="font-semibold text-navy">${camp.fullSummerPrice.toLocaleString()}</span> · {camp.weeks.length} weeks</p>}
            {camp.website && <a href={camp.website} target="_blank" rel="noreferrer" className="font-semibold text-teal underline">Visit provider</a>}
            {camp.phone && <span className="ml-2">{camp.phone}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}
