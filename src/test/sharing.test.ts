import { describe, expect, it } from "vitest";
import { canShareCamp, campShareUrl } from "@/lib/sharing";

describe("Camp sharing", () => {
  it("does not allow signed-out users to share", () => {
    expect(canShareCamp(null)).toBe(false);
    expect(canShareCamp(undefined)).toBe(false);
  });
  it("allows logged-in users to share", () => {
    expect(canShareCamp({ id: "parent-1" })).toBe(true);
  });
  it("links to the selected camp without private family details", () => {
    const url = new URL(campShareUrl("bayberry-art", "19709"));
    expect(url.origin).toBe("https://kodanzcamp.lovable.app");
    expect(url.pathname).toBe("/camps");
    expect([...url.searchParams.entries()]).toEqual([["zip", "19709"], ["camp", "bayberry-art"]]);
  });
});