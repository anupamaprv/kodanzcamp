import nature from "@/assets/camp-nature.jpg";
import stem from "@/assets/camp-stem.jpg";
import arts from "@/assets/camp-arts.jpg";
import sports from "@/assets/camp-sports.jpg";

export const INTERESTS = ["STEM", "Sports", "Arts", "Nature", "Dance", "Coding", "Music"] as const;
export type Interest = (typeof INTERESTS)[number];

/** Summer 2027 weeks, Mondays. */
export const SUMMER_WEEKS = [
  "2027-06-07", "2027-06-14", "2027-06-21", "2027-06-28", "2027-07-05", "2027-07-12",
  "2027-07-19", "2027-07-26", "2027-08-02", "2027-08-09", "2027-08-16",
];

export type Camp = {
  id: string;
  name: string;
  provider: string;
  interests: Interest[];
  minAge: number;
  maxAge: number;
  pricePerWeek: number;
  fullSummerPrice: number;
  hours: string;
  weeks: string[];
  image: string;
  /** Base offset from home in miles (x east, y north) */
  dx: number;
  dy: number;
};

const all = SUMMER_WEEKS;
const RAW: Omit<Camp, "fullSummerPrice">[] = [
  { id: "riverbend", name: "Riverbend Adventure Camp", provider: "Riverbend Outdoors", interests: ["Nature", "Sports"], minAge: 7, maxAge: 13, pricePerWeek: 310, hours: "9am – 3pm", weeks: all, image: nature, dx: 9, dy: -11 },
  { id: "nature-explorers", name: "Nature Explorers Camp", provider: "Greenway Conservancy", interests: ["Nature"], minAge: 6, maxAge: 12, pricePerWeek: 325, hours: "8:30am – 3:30pm", weeks: all.slice(0, 9), image: nature, dx: -6, dy: 5.5 },
  { id: "stem-robotics", name: "STEM Robotics Camp", provider: "BrightBots Academy", interests: ["STEM", "Coding"], minAge: 9, maxAge: 14, pricePerWeek: 350, hours: "9am – 4pm", weeks: all.slice(2), image: stem, dx: 8, dy: 9 },
  { id: "creative-arts", name: "Creative Arts Studio", provider: "Paintbox Collective", interests: ["Arts"], minAge: 5, maxAge: 12, pricePerWeek: 275, hours: "9am – 2pm", weeks: all, image: arts, dx: -5, dy: -3.5 },
  { id: "all-star", name: "All-Star Sports Week", provider: "Valley Youth Athletics", interests: ["Sports"], minAge: 6, maxAge: 14, pricePerWeek: 290, hours: "9am – 3pm", weeks: all, image: sports, dx: -9, dy: -8 },
  { id: "code-quest", name: "Code Quest Junior", provider: "Pixel Labs", interests: ["Coding", "STEM"], minAge: 8, maxAge: 13, pricePerWeek: 340, hours: "9am – 3pm", weeks: all.slice(1, 10), image: stem, dx: 3, dy: 4 },
  { id: "rhythm", name: "Rhythm & Moves Dance", provider: "Studio Juniper", interests: ["Dance", "Music"], minAge: 6, maxAge: 14, pricePerWeek: 260, hours: "10am – 3pm", weeks: all, image: arts, dx: 12, dy: -2 },
  { id: "tennis", name: "Lakeside Tennis Camp", provider: "Lakeside Racquet Club", interests: ["Sports"], minAge: 8, maxAge: 15, pricePerWeek: 295, hours: "8am – 12pm", weeks: all, image: sports, dx: -12, dy: 10 },
  { id: "makers", name: "Young Makers Workshop", provider: "Forge Makerspace", interests: ["STEM", "Arts"], minAge: 7, maxAge: 12, pricePerWeek: 315, hours: "9am – 3pm", weeks: all.slice(0, 8), image: stem, dx: 1.5, dy: -6 },
  { id: "music", name: "Summer Strings & Songs", provider: "Harmony Music School", interests: ["Music", "Arts"], minAge: 5, maxAge: 11, pricePerWeek: 240, hours: "9am – 1pm", weeks: all, image: arts, dx: 5, dy: 13 },
];

/** Full-summer package: 10% off the weekly rate across every offered week. */
export const CAMPS: Camp[] = RAW.map((c) => ({ ...c, fullSummerPrice: Math.round(c.pricePerWeek * c.weeks.length * 0.9) }));

/** Deterministic, ZIP-dependent jitter so distances feel local. */
function zipSeed(zip: string) {
  let h = 0;
  for (const c of zip) h = (h * 31 + c.charCodeAt(0)) % 997;
  return h;
}

export type CampResult = Camp & { x: number; y: number; miles: number; minutes: number };

export function locateCamps(zip: string): CampResult[] {
  const s = zipSeed(zip || "00000");
  return CAMPS.map((c, i) => {
    const j = ((s * (i + 3)) % 40) / 20 - 1; // -1..1
    const x = c.dx + j * 1.5;
    const y = c.dy - j * 1.2;
    const miles = Math.round(Math.hypot(x, y) * 10) / 10;
    return { ...c, x, y, miles, minutes: Math.round(miles * 1.5 + 4) };
  });
}

export type SortKey = "distance" | "cost";

export function searchCamps(opts: {
  zip: string;
  age?: number;
  interests?: string[];
  radius?: number;
  sort?: SortKey;
}): CampResult[] {
  const { zip, age, interests = [], radius = 30, sort = "distance" } = opts;
  return locateCamps(zip)
    .filter((c) => c.miles <= radius)
    .filter((c) => (age ? age >= c.minAge && age <= c.maxAge : true))
    .filter((c) => (interests.length ? c.interests.some((i) => interests.includes(i)) : true))
    .sort((a, b) =>
      sort === "cost"
        ? a.pricePerWeek - b.pricePerWeek || a.miles - b.miles
        : a.miles - b.miles || a.pricePerWeek - b.pricePerWeek,
    );
}

/** Price for selected weeks; full summer uses the package price when cheaper. */
export function priceFor(camp: Camp, weeks: string[], fullSummer: boolean) {
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
      `DESCRIPTION:${camp.provider} · ${camp.hours} · $${camp.pricePerWeek}/week`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
