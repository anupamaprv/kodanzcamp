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
  weeks?: string[];
};

// Only fields supported by a reviewed official source belong here.
export const CAMP_EVIDENCE: Record<string, CampEvidence> = {};

export const FLYER_IDS = new Set([
  "summer-art-camp-july-middletown", "shilpi-fine-arts-summer-art-camp-middletown",
  "navarasa-school-of-dance-bharatanatyam-newark", "wize-steam-enrichment-whitehall-middletown",
]);