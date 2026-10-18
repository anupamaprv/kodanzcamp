import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const cache = new Map<string, { lat: number; lng: number; label: string }>();

/** Turns a US ZIP code into map coordinates (cached per server instance). */
export const geocodeZip = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ zip: z.string().regex(/^\d{5}$/) }).parse(d))
  .handler(async ({ data }) => {
    const hit = cache.get(data.zip);
    if (hit) return { ok: true as const, ...hit };
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
    if (!lovableKey || !mapsKey) return { ok: false as const, error: "Maps is not configured" };
    const res = await fetch(
      `${GATEWAY_URL}/maps/api/geocode/json?components=${encodeURIComponent(`postal_code:${data.zip}|country:US`)}`,
      { headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": mapsKey } },
    );
    if (!res.ok) {
      console.error(`Geocode failed [${res.status}]: ${await res.text()}`);
      return { ok: false as const, error: "Couldn't look up that ZIP code" };
    }
    const json = (await res.json()) as {
      status: string;
      results: { formatted_address: string; geometry: { location: { lat: number; lng: number } } }[];
    };
    const r = json.results[0];
    if (json.status !== "OK" || !r) return { ok: false as const, error: "ZIP code not found" };
    const val = { lat: r.geometry.location.lat, lng: r.geometry.location.lng, label: r.formatted_address };
    cache.set(data.zip, val);
    return { ok: true as const, ...val };
  });
