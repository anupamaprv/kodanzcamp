import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { geocodeZip } from "@/lib/geocode.functions";
import { useHomeZip, useSavedPlaces } from "@/lib/family";

export type MapPlace = { key: string; label: string; zip: string; kind: "home" | "office"; lat: number; lng: number };

/** Home + office ZIPs for the signed-in family, with map coordinates. */
export function useMapPlaces(enabled: boolean): MapPlace[] {
  const home = useHomeZip(enabled);
  const places = useSavedPlaces(enabled);
  const list = [
    ...(home.data ? [{ key: "home", label: "Home", zip: home.data, kind: "home" as const }] : []),
    ...(places.data ?? []).map((p) => ({ key: p.id, label: p.label, zip: p.zip, kind: "office" as const })),
  ];
  const geos = useQueries({
    queries: list.map((p) => ({
      queryKey: ["geocode", p.zip],
      queryFn: () => geocodeZip({ data: { zip: p.zip } }),
      staleTime: Infinity,
    })),
  });
  const out = list.flatMap((p, i) => {
    const g = geos[i]?.data;
    return g?.ok ? [{ ...p, lat: g.lat, lng: g.lng }] : [];
  });
  const sig = out.map((p) => `${p.key}:${p.label}:${p.lat},${p.lng}`).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => out, [sig]);
}

/** Straight-line miles between two points. */
export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const cos = Math.cos((((a.lat + b.lat) / 2) * Math.PI) / 180);
  return Math.round(Math.hypot((a.lng - b.lng) * 69.17 * cos, (a.lat - b.lat) * 69.17) * 10) / 10;
}
