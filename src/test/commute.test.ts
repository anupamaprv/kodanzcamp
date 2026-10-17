import { describe, it, expect } from "vitest";
import { commuteInput, parseRoadRoute } from "@/lib/commute";

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
  it("rejects unavailable routes instead of fabricating a zero drive", () => expect(() => parseRoadRoute({ routes: [] })).toThrow());
  it("rejects malformed duration", () => expect(() => parseRoadRoute({ routes: [{ duration: "unknown", polyline: { encodedPolyline: polyline } }] })).toThrow());
  it("rejects incomplete geometry", () => expect(() => parseRoadRoute({ routes: [{ duration: "1s", polyline: { encodedPolyline: "_" } }] })).toThrow());
  it("caps a comparison at four camp stops", () => {
    expect(commuteInput.safeParse({ campIds: ["a", "b", "c", "d"], direction: "pickup" }).success).toBe(true);
    expect(commuteInput.safeParse({ campIds: ["a", "b", "c", "d", "e"], direction: "pickup" }).success).toBe(false);
  });
  it("does not accept empty comparisons", () => expect(commuteInput.safeParse({ campIds: [], direction: "dropoff" }).success).toBe(false));
});