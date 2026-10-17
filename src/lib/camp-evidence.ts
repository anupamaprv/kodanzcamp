export type CampEvidence = {
  sourceUrl?: string;
  checkedAt?: string;
  confirmed2027?: boolean;
  minAge?: number;
  maxAge?: number;
  hours?: string;
  dayType?: "full" | "half";
  pricePerWeek?: number;
  priceYear?: number;
  detailsYear?: number;
  weeks?: string[];
};

// Only fields supported by a reviewed official source belong here.
export const CAMP_EVIDENCE: Record<string, CampEvidence> = {
  "camp-silver-lake-middletown": { sourceUrl: "https://www.ymcade.org/locations/middletown-ymca/campsilverlake/", checkedAt: "2026-10-17", hours: "7am–6pm, Monday–Friday", dayType: "full" },
  "sport-and-swim-camp-east-madison-y-seattle": { sourceUrl: "https://www.seattleymca.org/programs/camp-and-outdoor-leadership/day-camp/programs/swim-sports", checkedAt: "2026-10-17", hours: "8:30am–4:30pm", dayType: "full", detailsYear: 2026 },
  "ymca-summer-day-camp-east-communities-austin": { sourceUrl: "https://www.austinymca.org/camp/summer-day/", checkedAt: "2026-10-17", minAge: 5, maxAge: 12, hours: "8am–5pm; extended care 7am–6pm", dayType: "full" },
  "bedford-stuyvesant-ymca-summer-camp-new-york-city": { sourceUrl: "https://ymcanyc.org/locations/bedford-stuyvesant-ymca/programs-classes/camps", checkedAt: "2026-10-17", minAge: 6, maxAge: 12, hours: "9am–5pm", dayType: "full", detailsYear: 2026 },
  "christian-street-ymca-camp-philadelphia": { sourceUrl: "https://www.philaymca.org/sites/default/files/2026-01/Christian%20Street%20YMCA%20Summer%20Camp%20Planner%202026.pdf", checkedAt: "2026-10-17", minAge: 6, maxAge: 14, hours: "7am–6pm including before/aftercare", dayType: "full", detailsYear: 2026 },
  "northside-ymca-summer-day-camp-richmond": { sourceUrl: "https://www.ymcarichmond.org/programs/camp/day-camp/", checkedAt: "2026-10-17", dayType: "full", detailsYear: 2026 },
  "summer-day-camp-buckhead-ymca-atlanta": { sourceUrl: "https://www.ymcaatlanta.org/sanders-y-camp-overview", checkedAt: "2026-10-17", hours: "Traditional camp 9am–4pm; separate half-day options", detailsYear: 2026 },
  "little-lions-camp-new-york-city": { sourceUrl: "https://perec.columbia.edu/littlelionscamp", checkedAt: "2026-10-17", minAge: 6, maxAge: 12, hours: "Arrival 8:15–9am; pickup 3pm", dayType: "full", detailsYear: 2026 },
  "champ-camp-at-university-of-washington-seattle": { sourceUrl: "https://www.discoverchampions.com/landing-pages/seattle-summer-break-003129", checkedAt: "2026-10-17", minAge: 5, maxAge: 12, hours: "9am–4pm; extended care 7:30am–5:30pm", dayType: "full", detailsYear: 2026 },
  "kula-karate-summer-camp-austin": { sourceUrl: "https://www.kulakarate.com/summer-camps", checkedAt: "2026-10-17", minAge: 4, maxAge: 12, hours: "9am–noon, Monday–Friday", dayType: "half", detailsYear: 2026 },
  "summer-science-camp-richmond": { sourceUrl: "https://smv.org/explore/things-to-do/summer-camp/", checkedAt: "2026-10-17", minAge: 6, maxAge: 12, hours: "9am–3pm", dayType: "full", detailsYear: 2026 },
  "summer-art-adventures-richmond": { sourceUrl: "https://www.vmfa.museum/summer-camps", checkedAt: "2026-10-17", detailsYear: 2026 },
  "camps-for-curious-minds-seattle": { sourceUrl: "https://pacificsciencecenter.org/education/camps/", checkedAt: "2026-10-17", detailsYear: 2026 },
  "aerospace-camp-experience-seattle": { sourceUrl: "https://www.museumofflight.org/ace", checkedAt: "2026-10-17" },
  "thinkery-summer-camp-austin": { sourceUrl: "https://thinkeryaustin.org/camp/summer/", checkedAt: "2026-10-17", hours: "9am–3pm", dayType: "full" },
  "austin-nature-science-center-camp-austin": { sourceUrl: "https://www.austintexas.gov/parks/programs/summer-camps", checkedAt: "2026-10-17", minAge: 5, maxAge: 12, detailsYear: 2026 },
  "northwest-recreation-center-summer-camp-austin": { sourceUrl: "https://www.austintexas.gov/parks/programs/summer-camps", checkedAt: "2026-10-17", minAge: 5, maxAge: 12, detailsYear: 2026 },
  "austin-zoo-summer-camp-austin": { sourceUrl: "https://austinzoo.org/summer-camps/", checkedAt: "2026-10-17", minAge: 6, maxAge: 12, detailsYear: 2026 },
  "dance-and-tumbling-summer-camp-new-york-city": { sourceUrl: "https://pixiepodskids.com/2026-summer-camp", checkedAt: "2026-10-17", minAge: 3.5, maxAge: 8, hours: "9am–4pm", dayType: "full", detailsYear: 2026 },
  "summer-farm-camp-new-york-city": { sourceUrl: "https://www.queensfarm.org/farm-camp/", checkedAt: "2026-10-17", minAge: 5, maxAge: 12, hours: "8:30am–3:30pm", dayType: "full" },
  "nature-explorers-summer-camp-philadelphia": { sourceUrl: "https://www.morrisarboretum.org/sites/default/files/2025-11/Parent%20Handbook%202026.pdf", checkedAt: "2026-10-17", minAge: 4, maxAge: 10, detailsYear: 2026 },
  "enrichment-summer-camp-queen-village-philadelphia": { sourceUrl: "https://phillyinmovement.com/summer-camp/", checkedAt: "2026-10-17", hours: "9am–3pm", dayType: "full" },
  "fernbank-summer-camp-atlanta": { sourceUrl: "https://www.fernbankmuseum.org/learn/community-programs/fernbank-camps/summer-camp/", checkedAt: "2026-10-17", minAge: 5, maxAge: 10, hours: "9am–4pm", dayType: "full", detailsYear: 2026 },
  "heron-day-camp-middletown": { sourceUrl: "https://www.stannesde.org/summer-camp", checkedAt: "2026-10-17", minAge: 3, maxAge: 13, detailsYear: 2026 },
  "brandywine-zoo-summer-camp-wilmington": { sourceUrl: "https://brandywinezoo.org/learn/camps/", checkedAt: "2026-10-17", minAge: 4, maxAge: 17, detailsYear: 2026 },
  "delaware-museum-of-nature-science-summer-camps-wilmington": { sourceUrl: "https://delmns.org/programs/camps/", checkedAt: "2026-10-17" },
};

export const FLYER_IDS = new Set([
  "summer-art-camp-july-middletown", "shilpi-fine-arts-summer-art-camp-middletown",
  "navarasa-school-of-dance-bharatanatyam-newark", "wize-steam-enrichment-whitehall-middletown",
]);