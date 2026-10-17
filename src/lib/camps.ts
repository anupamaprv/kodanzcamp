import nature from "@/assets/camp-nature.jpg";
import stem from "@/assets/camp-stem.jpg";
import arts from "@/assets/camp-arts.jpg";
import sports from "@/assets/camp-sports.jpg";
import coding from "@/assets/camp-coding.jpg";
import dance from "@/assets/camp-dance.jpg";
import tennis from "@/assets/camp-tennis.jpg";
import makers from "@/assets/camp-makers.jpg";
import music from "@/assets/camp-music.jpg";
import explorers from "@/assets/camp-explorers.jpg";
import swim from "@/assets/camp-swim.jpg";
import karate from "@/assets/camp-karate.jpg";
import museum from "@/assets/camp-museum.jpg";
import academic from "@/assets/camp-academic.jpg";
import zoo from "@/assets/camp-zoo.jpg";
import daycamp from "@/assets/camp-daycamp.jpg";
import gym from "@/assets/camp-gym.jpg";
import raw from "@/data/camps.json";

export const INTERESTS = [
  "STEM", "Sports", "Arts", "Nature", "Dance", "Coding", "Music", "Swim", "Martial Arts", "Academic",
] as const;
export type Interest = (typeof INTERESTS)[number];

/** Summer 2027 weeks, Mondays. */
export const SUMMER_WEEKS = [
  "2027-06-07", "2027-06-14", "2027-06-21", "2027-06-28", "2027-07-05", "2027-07-12",
  "2027-07-19", "2027-07-26", "2027-08-02", "2027-08-09", "2027-08-16", "2027-08-23",
  "2027-08-30",
];

export type RawCamp = {
  id: string;
  name: string;
  provider: string;
  city: string;
  state: string;
  address: string;
  website?: string | null;
  phone?: string | null;
  interests: string[];
  minAge: number;
  maxAge: number;
  pricePerWeek: number | null;
  dayType: "full" | "half";
  hours: string | null;
  weeks?: string[] | null;
  note?: string | null;
  source?: string | null;
  lat: number;
  lng: number;
};

export type Camp = Omit<RawCamp, "weeks" | "interests"> & {
  interests: Interest[];
  weeks: string[];
  fullSummerPrice: number | null;
  image: string;
};

const IMAGES: Record<string, string[]> = {
  Swim: [swim], "Martial Arts": [karate], Dance: [dance], Music: [music], Coding: [coding],
  STEM: [stem, makers, museum], Arts: [arts, museum], Nature: [nature, explorers],
  Sports: [sports, tennis, gym], Academic: [academic],
};

/** Picks a photo by the camp's main interest; varies within a category so neighbors differ. */
function imageFor(c: RawCamp, i: number) {
  const n = c.name.toLowerCase();
  if (/gymnast|tumbl|ninja/.test(n)) return gym;
  if (/tennis/.test(n)) return tennis;
  if (/museum|science center|institute|zoo|aquarium/.test(n)) return museum;
  const pool = IMAGES[c.interests[0] ?? "Sports"] ?? [sports];
  return pool[i % pool.length]!;
}

/** Full-summer package: 10% off the weekly rate across every offered week. */
export const CAMPS: Camp[] = (raw as RawCamp[]).map((c, i) => {
  const weeks = c.weeks?.length ? c.weeks : SUMMER_WEEKS;
  const interests = c.interests.filter((x): x is Interest => (INTERESTS as readonly string[]).includes(x));
  return {
    ...c,
    interests,
    weeks,
    image: imageFor(c, i),
    fullSummerPrice: c.pricePerWeek == null ? null : Math.round(c.pricePerWeek * weeks.length * 0.9),
  };
});

export type LatLng = { lat: number; lng: number };
/** x/y are miles east/north of home. */
export type CampResult = Camp & { x: number; y: number; miles: number; minutes: number };

const DEFAULT_CENTER = { lat: 39.4496, lng: -75.7163 }; // Middletown, DE

export function locateCamps(_zip: string, center: LatLng = DEFAULT_CENTER): CampResult[] {
  const cos = Math.cos((center.lat * Math.PI) / 180);
  return CAMPS.map((c) => {
    const x = (c.lng - center.lng) * 69.17 * cos;
    const y = (c.lat - center.lat) * 69.17;
    const miles = Math.round(Math.hypot(x, y) * 10) / 10;
    // Rough drive time: ~25 mph average plus a few minutes to park.
    return { ...c, x, y, miles, minutes: Math.round(miles * 2.4 + 4) };
  });
}

export type SortKey = "distance" | "cost";

export function searchCamps(opts: {
  zip: string;
  age?: number | undefined;
  interests?: string[];
  radius?: number;
  sort?: SortKey;
  center?: LatLng | undefined;
  fullDayOnly?: boolean;
}): CampResult[] {
  const { center, zip, age, interests = [], radius = 30, sort = "distance", fullDayOnly = false } = opts;
  const price = (c: Camp) => c.pricePerWeek ?? Number.POSITIVE_INFINITY;
  return locateCamps(zip, center)
    .filter((c) => c.miles <= radius)
    .filter((c) => (age ? age >= c.minAge && age <= c.maxAge : true))
    .filter((c) => (interests.length ? c.interests.some((i) => interests.includes(i)) : true))
    .filter((c) => (fullDayOnly ? c.dayType === "full" : true))
    .sort((a, b) =>
      sort === "cost"
        ? price(a) - price(b) || a.miles - b.miles
        : a.miles - b.miles || price(a) - price(b),
    );
}

/** Price for selected weeks; null when the camp hasn't published a price. */
export function priceFor(camp: Camp, weeks: string[], fullSummer: boolean) {
  if (camp.pricePerWeek == null) return null;
  if (fullSummer) return camp.fullSummerPrice;
  return camp.pricePerWeek * weeks.length;
}

export function weekLabel(monday: string) {
  const d = new Date(monday + "T12:00:00");
  const f = new Date(d);
  f.setDate(d.getDate() + 4);
  const fmt = (x: Date) => x.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(d)} – ${fmt(f)}`;
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/** Builds an .ics file with one Mon–Fri all-day event per selected week. */
export function buildIcs(camp: Camp, weeks: string[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Kodanz//Summer Camps//EN"];
  for (const w of weeks) {
    const start = new Date(w + "T12:00:00Z");
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 5);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${camp.id}-${w}@kodanz`,
      `DTSTART;VALUE=DATE:${ymd(start)}`,
      `DTEND;VALUE=DATE:${ymd(end)}`,
      `SUMMARY:${camp.name}`,
      `LOCATION:${camp.address}`,
      `DESCRIPTION:${camp.provider}${camp.hours ? ` · ${camp.hours}` : ""}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
