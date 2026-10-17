import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CAMPS } from "@/lib/camps";
import { commuteInput, parseRoadRoute, type CommuteResult } from "@/lib/commute";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

export const calculateCommute = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => commuteInput.parse(input))
  .handler(async ({ data, context }): Promise<CommuteResult> => {
    const ids = [...new Set(data.campIds)];
    const camps = ids.map((id) => CAMPS.find((c) => c.id === id));
    if (camps.some((c) => !c)) throw new Error("Camp not found");
    const [home, offices, addresses] = await Promise.all([
      context.supabase.from("households").select("home_zip").eq("user_id", context.userId).maybeSingle(),
      context.supabase.from("saved_places").select("id,label,zip").eq("user_id", context.userId),
      context.supabase.from("commute_addresses").select("place_key,address").eq("user_id", context.userId),
    ]);
    if (home.error || offices.error || addresses.error) throw new Error("Could not read your saved places");
    if (!home.data?.home_zip) throw new Error("Save your home ZIP in My summer first");
    const office = data.officeKey ? offices.data?.find((p) => p.id === data.officeKey) : null;
    if (data.officeKey && !office) throw new Error("Saved office not found");
    const addressFor = (key: string, zip: string) => addresses.data?.find((p) => p.place_key === key)?.address ?? `${zip}, USA`;
    const homeAddress = addressFor("home", home.data.home_zip);
    const officeAddress = office ? addressFor(office.id, office.zip) : homeAddress;
    const ordered = data.direction === "pickup" ? [...camps].reverse() : camps;
    const stops = ordered.flatMap((c) => c ? [c] : []);
    const campWaypoint = (c: typeof stops[number]) => ({ address: c.address });
    if (!stops.length) throw new Error("Choose a camp");
    const first = stops[0]; const last = stops.at(-1);
    if (!first || !last) throw new Error("Choose a camp");
    const origin = !office && data.direction === "pickup" ? campWaypoint(first) : { address: data.direction === "pickup" ? officeAddress : homeAddress };
    const destination = office ? { address: data.direction === "pickup" ? homeAddress : officeAddress } : data.direction === "pickup" ? { address: homeAddress } : campWaypoint(last);
    const intermediates = (office ? stops : data.direction === "pickup" ? stops.slice(1) : stops.slice(0, -1)).map(campWaypoint);
    const keyBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify({ origin, destination, intermediates, direction: data.direction })));
    const cacheKey = Array.from(new Uint8Array(keyBytes), (b) => b.toString(16).padStart(2, "0")).join("");
    const cached = await context.supabase.from("commute_route_cache").select("result").eq("user_id", context.userId).eq("cache_key", cacheKey).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (cached.data) return cached.data.result as unknown as CommuteResult;
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
    if (!lovableKey || !mapsKey) throw new Error("Google Maps is not configured");
    async function route(via: typeof intermediates) {
      const response = await fetch(`${GATEWAY_URL}/routes/directions/v2:computeRoutes`, {
        method: "POST", headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": mapsKey ?? "", "Content-Type": "application/json", "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline" },
        body: JSON.stringify({ origin, destination, intermediates: via, travelMode: "DRIVE", routingPreference: "TRAFFIC_AWARE", computeAlternativeRoutes: false }),
      });
      if (!response.ok) {
        const body = await response.text(); console.error(`Google Routes failed [${response.status}]: ${body}`);
        if (response.status === 403) {
          if (body.includes("API_KEY_HTTP_REFERRER_BLOCKED")) throw new Error("Google Maps server key is referrer-restricted. Set its application restrictions to None or IP addresses in Google Cloud Console.");
          if (body.includes("API_KEY_SERVICE_BLOCKED")) throw new Error("Enable Routes API and add it to the server key's allowed APIs in Google Cloud Console.");
          throw new Error("Google Maps denied this request (403). Check the server key restrictions in Google Cloud Console.");
        }
        throw new Error(`Google Maps request failed [${response.status}]: ${body}`);
      }
      return parseRoadRoute(await response.json());
    }
    const [road, baseline] = await Promise.all([route(intermediates), office ? route([]) : Promise.resolve(null)]);
    const result: CommuteResult = { route: road, baseline, from: data.direction === "pickup" ? office?.label ?? first.name : "Home", to: data.direction === "pickup" ? "Home" : office?.label ?? last.name, stops: stops.map((c) => c.name), approximateStart: !addresses.data?.some((p) => p.place_key === "home") || (!!office && !addresses.data?.some((p) => p.place_key === office.id)), calculatedAt: new Date().toISOString() };
    await context.supabase.from("commute_route_cache").upsert({ user_id: context.userId, cache_key: cacheKey, result: JSON.parse(JSON.stringify(result)), expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() });
    return result;
  });