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