import { describe, it, expect } from "vitest";
import { canRouteCamp, commuteInput, parseRoadRoute } from "@/lib/commute";

const polyline = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
describe("real route parsing and bounds", () => {
  it("retains fractional seconds and meters", () => {
    const result = parseRoadRoute({ routes: [{ distanceMeters: 1609.344, duration: "12.5s", polyline: { encodedPolyline: polyline } }] });
    expect(result.seconds).toBe(12.5); expect(result.meters).toBe(1609.344);
    expect(result.path[0]).toEqual({ lat: 38.5, lng: -120.2 });
  });
  it("preserves omitted protobuf distance as zero on a valid route", () => {
    expect(parseRoadRoute({ routes: [{ duration: "0s", polyline: { encodedPolyline: polyline } }] }).meters).toBe(0);
  });
  it("rejects unavailable routes instead of fabricating a zero drive", () => expect(() => parseRoadRoute({ routes: [] })).toThrow("could not find a driving route"));
  it("handles Google's omitted routes field when no route is available", () => expect(() => parseRoadRoute({})).toThrow("could not find a driving route"));
  it("rejects incomplete responses without exposing a schema exception", () => expect(() => parseRoadRoute({ routes: [{}] })).toThrow("incomplete driving directions"));
  it("excludes everywhere synthetic camps without a fixed destination", () => expect(canRouteCamp({ address: "Near your ZIP", everywhere: true })).toBe(false));
  it("excludes blank addresses", () => expect(canRouteCamp({ address: "  " })).toBe(false));
  it("allows a camp with a fixed address", () => expect(canRouteCamp({ address: "735 Mapleton Ave, Middletown, DE" })).toBe(true));
  it("rejects malformed duration", () => expect(() => parseRoadRoute({ routes: [{ duration: "unknown", polyline: { encodedPolyline: polyline } }] })).toThrow());
  it("rejects incomplete geometry", () => expect(() => parseRoadRoute({ routes: [{ duration: "1s", polyline: { encodedPolyline: "_" } }] })).toThrow());
  it("caps a comparison at four camp stops", () => {
    expect(commuteInput.safeParse({ campIds: ["a", "b", "c", "d"], direction: "pickup" }).success).toBe(true);
    expect(commuteInput.safeParse({ campIds: ["a", "b", "c", "d", "e"], direction: "pickup" }).success).toBe(false);
  });
  it("does not accept empty comparisons", () => expect(commuteInput.safeParse({ campIds: [], direction: "dropoff" }).success).toBe(false));
});