import { z } from "zod";

export const commuteInput = z.object({
  campIds: z.array(z.string().min(1).max(120)).min(1).max(4),
  officeKey: z.string().max(80).optional(),
  direction: z.enum(["dropoff", "pickup"]),
});
export type CommuteInput = z.infer<typeof commuteInput>;
export type RoadRoute = { meters: number; seconds: number; path: { lat: number; lng: number }[] };
export type CommuteResult = { route: RoadRoute; baseline: RoadRoute | null; from: string; to: string; stops: string[]; approximateStart: boolean; calculatedAt: string };

export function parseRoadRoute(body: unknown): RoadRoute {
  const parsed = z.object({ routes: z.array(z.object({
    distanceMeters: z.number().nonnegative().optional(), duration: z.string(),
    polyline: z.object({ encodedPolyline: z.string().min(1).max(100000) }),
  })).min(1) }).parse(body);
  const route = parsed.routes[0];
  if (!route || !/^\d+(\.\d+)?s$/.test(route.duration)) throw new Error("Google returned an invalid travel time");
  const seconds = Number(route.duration.slice(0, -1));
  if (!Number.isFinite(seconds)) throw new Error("Invalid duration");
  return { meters: route.distanceMeters ?? 0, seconds, path: decodePolyline(route.polyline.encodedPolyline) };
}

export function decodePolyline(encoded: string) {
  const path: { lat: number; lng: number }[] = [];
  let offset = 0, lat = 0, lng = 0;
  function next() {
    let value = 0, shift = 0, byte = 0;
    do {
      if (offset >= encoded.length || shift > 30) throw new Error("Invalid route geometry");
      byte = encoded.charCodeAt(offset++) - 63;
      if (byte < 0 || byte > 63) throw new Error("Invalid route geometry");
      value |= (byte & 31) << shift; shift += 5;
    } while (byte >= 32);
    return value & 1 ? ~(value >> 1) : value >> 1;
  }
  while (offset < encoded.length) {
    lat += next(); lng += next();
    if (Math.abs(lat / 1e5) > 90 || Math.abs(lng / 1e5) > 180) throw new Error("Invalid route geometry");
    path.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  if (path.length < 2) throw new Error("Incomplete route geometry");
  return path;
}