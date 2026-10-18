import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Car, ChevronDown, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { geocodeZip } from "@/lib/geocode.functions";
import { locateCamps, type CampResult } from "@/lib/camps";
import { loadMaps } from "@/components/CampMap";
import { useHomeZip, usePlaceMutations, type Favorite, type Kid, type Plan } from "@/lib/family";
import { useMapPlaces, type MapPlace } from "@/lib/places";
import { officePinIcon } from "@/lib/mapIcons";
import { Button } from "@/components/ui/button";
import { CommuteComparison } from "@/components/CommuteComparison";
import type { CommuteResult } from "@/lib/commute";

/** Map-only colors (Google Maps needs raw values); legend reuses them. */
const KID_COLORS = ["#0e8a8a", "#e8775a", "#7c4dbc", "#d9a400", "#16324a"];

function bearing(c: CampResult) {
  return (Math.atan2(c.x, c.y) * 180) / Math.PI;
}
function angleBetween(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function DrivingZone({ kids, plans, favorites }: { kids: Kid[]; plans: Plan[]; favorites: Favorite[] }) {
  const [open, setOpen] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [road, setRoad] = useState<CommuteResult | null>(null);

  const household = useHomeZip(true);
  const zip = household.data ?? undefined;
  const { saveHome: saveZip } = usePlaceMutations();
  const offices = useMapPlaces(open).filter((p) => p.kind === "office");

  const geo = useQuery({
    queryKey: ["geocode", zip],
    queryFn: () => geocodeZip({ data: { zip: zip ?? "" } }),
    enabled: open && !!zip,
    staleTime: Infinity,
  });
  const center = geo.data?.ok ? { lat: geo.data.lat, lng: geo.data.lng } : undefined;

  const perKid = useMemo(() => {
    if (!zip) return [];
    const located = Object.fromEntries(locateCamps(zip, center).map((c) => [c.id, c]));
    return kids.map((k, i) => {
      const ids = new Set([
        ...plans.filter((p) => p.kid_id === k.id).map((p) => p.camp_id),
        ...favorites.filter((f) => f.kid_ids.includes(k.id)).map((f) => f.camp_id),
      ]);
      return { kid: k, color: KID_COLORS[i % KID_COLORS.length] ?? KID_COLORS[0] ?? "", camps: [...ids].map((id) => located[id]).filter((c): c is CampResult => !!c) };
    });
  }, [zip, center?.lat, center?.lng, kids, plans, favorites]);

  const warnings = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < perKid.length; i++)
      for (let j = i + 1; j < perKid.length; j++)
        for (const a of perKid[i]?.camps ?? [])
          for (const b of perKid[j]?.camps ?? [])
            if (a.id !== b.id && angleBetween(bearing(a), bearing(b)) > 120)
              out.push(`${perKid[i]?.kid.name} (${a.name}) and ${perKid[j]?.kid.name} (${b.name}) are in opposite directions. Calculate a road route to compare the drive.`);
    return out.slice(0, 4);
  }, [perKid]);

  if (kids.length < 2) return null;

  return (
    <section className="rounded-3xl border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-navy"><Car className="h-5 w-5 text-teal" /> Driving zone</h2>
          <p className="text-sm text-muted-foreground">See each child's camps around home. Are drop-offs in opposite directions?</p>
        </div>
        <Button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="gap-1">
          {open ? "Hide driving zone" : "Show driving zone"}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {open && (zip ? null : (
        <form className="mt-4 flex flex-wrap items-center gap-2" onSubmit={async (e) => {
          e.preventDefault();
          if (!/^\d{5}$/.test(zipInput.trim())) { toast.error("Enter a 5-digit ZIP code"); return; }
          await saveZip.mutateAsync(zipInput.trim());
        }}>
          <MapPin className="h-4 w-4 text-teal" />
          <span className="text-sm font-semibold">What's your home ZIP code?</span>
          <input value={zipInput} onChange={(e) => setZipInput(e.target.value)} inputMode="numeric" maxLength={5} placeholder="19709" className="w-28 rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          <button className="rounded-xl bg-primary px-3 py-2 font-semibold text-primary-foreground">Save</button>
        </form>
      ))}

      {open && zip && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          {center ? <ZoneMap center={center} groups={perKid} offices={offices} road={road} /> : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border text-sm text-muted-foreground">
              {geo.data && !geo.data.ok ? geo.data.error : "Loading map…"}
            </div>
          )}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Home ZIP <b>{zip}</b></span>
              <button onClick={() => { const z = prompt("New home ZIP code", zip); if (z && /^\d{5}$/.test(z)) saveZip.mutate(z); }} className="font-semibold text-teal underline">Change</button>
            </div>
            <ul className="space-y-2">
              {perKid.map((g) => (
                <li key={g.kid.id} className="rounded-xl border p-3">
                  <p className="flex items-center gap-2 font-semibold text-navy"><span className="h-3 w-3 rounded-full" style={{ background: g.color }} />{g.kid.name}</p>
                  {g.camps.length ? g.camps.map((c) => <p key={c.id} className="text-xs text-muted-foreground">{c.name} · {c.miles} mi straight-line</p>)
                    : <p className="text-xs text-muted-foreground">No camps saved or planned yet.</p>}
                </li>
              ))}
            </ul>
            {warnings.length > 0 ? (
              <div className="rounded-xl bg-coral-soft p-3 text-sm text-navy">
                <p className="font-semibold">Opposite directions</p>
                {warnings.map((w) => <p key={w} className="mt-1 text-xs">{w}</p>)}
              </div>
            ) : perKid.some((g) => g.camps.length) ? (
              <p className="rounded-xl bg-teal-soft p-3 text-sm text-navy">Nice — your kids' camps are roughly in the same direction.</p>
            ) : null}
            <CommuteComparison camps={[...new Map(perKid.flatMap((g) => g.camps).map((c) => [c.id, c])).values()]} onRoute={setRoad} />
            <p className="text-xs text-muted-foreground">Camp pins use directory locations. Road calculations use provider addresses. Choose up to four stops; pickup reverses drop-off order.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function ZoneMap({ center, groups, offices, road }: { road: CommuteResult | null; center: { lat: number; lng: number }; offices: MapPlace[]; groups: { kid: Kid; color: string; camps: CampResult[] }[] }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const overlays = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMaps().then(() => {
      if (!el.current || map.current) return;
      map.current = new window.google.maps.Map(el.current, {
        center, zoom: 11, clickableIcons: false, mapTypeControl: false, streetViewControl: false,
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
      });
      setReady(true);
    }).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const g = window.google;
    if (!ready || !g) return;
    overlays.current.forEach((o) => o.setMap(null));
    overlays.current = [];
    const m = map.current;
    const bounds = new g.maps.LatLngBounds(center);
    overlays.current.push(new g.maps.Marker({ map: m, position: center, title: "Home", label: { text: "⌂", color: "#ffffff", fontSize: "16px" }, zIndex: 20 }));
    offices.forEach((o) => {
      bounds.extend(o);
      overlays.current.push(new g.maps.Marker({ map: m, position: { lat: o.lat, lng: o.lng }, title: `${o.label} (${o.zip})`, icon: officePinIcon(g, "#16324a"), zIndex: 15 }));
    });
    groups.forEach((grp) => grp.camps.forEach((c) => {
      const pos = { lat: c.lat, lng: c.lng };
      bounds.extend(pos);
      overlays.current.push(
        new g.maps.Marker({
          map: m, position: pos, title: `${grp.kid.name}: ${c.name}`,
          label: { text: grp.kid.name.slice(0, 1).toUpperCase(), color: "#ffffff", fontWeight: "700" },
          icon: { path: g.maps.SymbolPath.CIRCLE, scale: 13, fillColor: grp.color, fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2 },
        }),
      );
    }));
    if (road) {
      overlays.current.push(new g.maps.Polyline({ map: m, path: road.route.path, strokeColor: KID_COLORS[0], strokeOpacity: 0.9, strokeWeight: 5 }));
      road.route.path.forEach((p) => bounds.extend(p));
    }
    if (offices.length || groups.some((x) => x.camps.length)) m.fitBounds(bounds, 60);
    else m.setCenter(center);
  }, [ready, groups, offices, center.lat, center.lng, road]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border bg-map-land">
      <div ref={el} className="absolute inset-0" />
      {error && <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">{error}</p>}
    </div>
  );
}
