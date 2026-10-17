import { useEffect, useRef, useState } from "react";
import type { CampResult } from "@/lib/camps";
import type { MapPlace } from "@/lib/places";
import { officePinIcon } from "@/lib/mapIcons";

declare global {
  interface Window {
    google?: any;
    __kodanzMapsReady?: () => void;
  }
}

export let loader: Promise<void> | null = null;
export function loadMaps() {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    window.__kodanzMapsReady = () => resolve();
    const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
    const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"];
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__kodanzMapsReady&channel=${channel}`;
    s.async = true;
    s.onerror = () => reject(new Error("Maps failed to load"));
    document.head.appendChild(s);
  });
  return loader;
}

const MILE_M = 1609.34;

/** Real Google map: home at the ZIP centre, camps as price pins. */
export function CampMap({ camps, radius, center, selected, onSelect, places = [], savedIds }: {
  places?: MapPlace[];
  savedIds?: Set<string>;
  camps: CampResult[];
  radius: number;
  center: { lat: number; lng: number };
  selected?: string | undefined;
  onSelect: (id: string) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const overlays = useRef<any[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadMaps()
      .then(() => {
        if (!el.current || map.current) return;
        map.current = new window.google.maps.Map(el.current, {
          center, zoom: 11, clickableIcons: false, mapTypeControl: false, streetViewControl: false,
          styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
        });
        setReady(true);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const g = window.google;
    if (!ready || !g) return;
    overlays.current.forEach((o) => o.setMap(null));
    overlays.current = [];
    const m = map.current;
    const circle = new g.maps.Circle({
      map: m, center, radius: radius * MILE_M, strokeColor: "#0e8a8a", strokeOpacity: 0.5,
      strokeWeight: 1, fillColor: "#0e8a8a", fillOpacity: 0.06, clickable: false,
    });
    const home = new g.maps.Marker({ map: m, position: center, title: "Home", label: { text: "⌂", color: "#ffffff", fontSize: "16px" } });
    overlays.current.push(circle, home);
    const bounds = circle.getBounds(); // undefined until the map has a projection
    places.filter((p) => p.kind === "office").forEach((p) => {
      bounds?.extend({ lat: p.lat, lng: p.lng });
      overlays.current.push(new g.maps.Marker({
        map: m, position: { lat: p.lat, lng: p.lng }, title: `${p.label} (${p.zip})`, zIndex: 20,
        icon: officePinIcon(g, "#7c4dbc"),
      }));
    });
    camps.forEach((c) => {
      const mk = new g.maps.Marker({
        map: m, position: { lat: c.lat, lng: c.lng }, title: `${c.name} · ${c.pricePerWeek != null ? `$${c.pricePerWeek}/wk` : 'price n/a'} · ${c.minutes} min`,
        label: { text: c.pricePerWeek != null ? `$${c.pricePerWeek}` : '$?', fontWeight: "700", fontSize: "11px", color: "#ffffff" },
        icon: {
          path: "M -22 -12 h 44 a 6 6 0 0 1 6 6 v 12 a 6 6 0 0 1 -6 6 h -16 l -6 7 l -6 -7 h -16 a 6 6 0 0 1 -6 -6 v -12 a 6 6 0 0 1 6 -6 z",
          fillColor: selected === c.id ? "#0e8a8a" : savedIds?.has(c.id) ? "#e8775a" : "#16324a", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 1.5,
          scale: 1, labelOrigin: new g.maps.Point(0, 0), anchor: new g.maps.Point(0, 19),
        },
        zIndex: selected === c.id ? 10 : 1,
      });
      mk.addListener("click", () => onSelect(c.id));
      overlays.current.push(mk);
    });
    m.setCenter(center);
    if (bounds) {
      camps.forEach((c) => { if (savedIds?.has(c.id)) bounds.extend({ lat: c.lat, lng: c.lng }); });
      m.fitBounds(bounds);
    }
  }, [ready, camps, radius, center.lat, center.lng, selected, places, savedIds]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border bg-map-land shadow-soft">
      <div ref={el} className="absolute inset-0" />
      {error && <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-muted-foreground">{error}</p>}
    </div>
  );
}
