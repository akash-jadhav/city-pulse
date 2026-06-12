import type {
  BusinessChallenge,
  CivicHazard,
  EmergencyResponse,
  HousingStatus,
  NewsSource,
  QualityRating,
  SafetyRating,
} from "@/types/survey";

export function normalizeQualityRating(raw: string): QualityRating {
  const text = stripStars(raw).toLowerCase();
  if (text.includes("great")) return "great";
  if (text.includes("good")) return "good";
  if (text.includes("average")) return "average";
  if (text.includes("bad")) return "bad";
  if (text.includes("horrible")) return "horrible";
  return "unknown";
}

export function normalizeSafetyRating(raw: string): SafetyRating {
  const text = stripStars(raw).toLowerCase();
  if (text.includes("completely safe")) return "completely_safe";
  if (text.includes("quite safe")) return "quite_safe";
  if (text.includes("sometimes safe")) return "sometimes_safe";
  if (text.includes("not safe")) return "not_safe";
  if (text.includes("terrified")) return "terrified";
  return "unknown";
}

export function normalizeHousingStatus(raw: string): HousingStatus {
  const text = raw.trim().toLowerCase();
  if (text.includes("tenant")) return "tenant";
  if (text.includes("home")) return "homeowner";
  return "other";
}

export function normalizeEmergencyResponse(raw: string): EmergencyResponse {
  const text = raw.trim().toLowerCase();
  if (text.includes("system works") || text.startsWith("yes")) return "system_works";
  if (text.includes("ignored") || text.includes("no response")) return "know_but_ignored";
  if (text.includes("no idea") || text.includes("don't know")) return "no_idea";
  return "unknown";
}

const HAZARD_MAP: [RegExp, CivicHazard][] = [
  [/garbage|dumping|waste/i, "poor_garbage_collection"],
  [/pothole|broken internal|broken road/i, "potholes_broken_roads"],
  [/crime|unsafe environment|petty crime/i, "petty_crime_unsafe"],
  [/water.?log|flooding|rain/i, "water_logging"],
  [/stray animal/i, "stray_animals"],
  [/streetlight|street light/i, "broken_streetlights"],
  [/park|green/i, "lack_of_parks"],
];

export function normalizeCivicHazards(raw: string): CivicHazard[] {
  if (!raw?.trim()) return [];
  const segments = raw.split(/,(?![^()]*\))/).map((s) => s.trim());
  const hazards = new Set<CivicHazard>();
  for (const segment of segments) {
    let matched = false;
    for (const [pattern, hazard] of HAZARD_MAP) {
      if (pattern.test(segment)) {
        hazards.add(hazard);
        matched = true;
        break;
      }
    }
    if (!matched && segment) hazards.add("other");
  }
  return [...hazards];
}

const BUSINESS_MAP: [RegExp, BusinessChallenge][] = [
  [/parking/i, "parking_congestion"],
  [/toilet/i, "lack_public_toilets"],
  [/harassment|administration/i, "harassment_by_administration"],
  [/garbage/i, "garbage"],
  [/electricity|tariff|power bill/i, "electricity_tariffs"],
  [/sealing/i, "sealing_threats"],
];

export function normalizeBusinessChallenges(raw: string): BusinessChallenge[] {
  if (!raw?.trim()) return [];
  const segments = raw.split(/,(?![^()]*\))/).map((s) => s.trim());
  const challenges = new Set<BusinessChallenge>();
  for (const segment of segments) {
    let matched = false;
    for (const [pattern, challenge] of BUSINESS_MAP) {
      if (pattern.test(segment)) {
        challenges.add(challenge);
        matched = true;
        break;
      }
    }
    if (!matched && segment) challenges.add("other");
  }
  return [...challenges];
}

export function normalizeNewsSources(raw: string): NewsSource[] {
  if (!raw?.trim()) return [];
  const segments = raw.split(/,(?![^()]*\))/).map((s) => s.trim());
  const sources = new Set<NewsSource>();
  for (const segment of segments) {
    const text = segment.toLowerCase();
    if (text.includes("social media") || text.includes("digital") || text.includes("influencer")) {
      sources.add("social_media");
    } else if (text.includes("domestic worker")) {
      sources.add("domestic_worker");
    } else if (text.includes("rwa")) {
      sources.add("rwa");
    } else if (text.includes("neighbour") || text.includes("neighbor")) {
      sources.add("neighbours");
    } else if (text.includes("newspaper")) {
      sources.add("newspapers");
    } else if (segment) {
      sources.add("other");
    }
  }
  return [...sources];
}

function stripStars(raw: string): string {
  return raw.replace(/⭐+/g, "").replace(/^[\s-]+/, "").trim();
}

export const QUALITY_SCORES: Record<QualityRating, number> = {
  great: 100,
  good: 75,
  average: 50,
  bad: 25,
  horrible: 0,
  unknown: 50,
};

export const SAFETY_SCORES: Record<SafetyRating, number> = {
  completely_safe: 100,
  quite_safe: 75,
  sometimes_safe: 50,
  not_safe: 25,
  terrified: 0,
  unknown: 50,
};

export const EMERGENCY_SCORES: Record<EmergencyResponse, number> = {
  system_works: 100,
  know_but_ignored: 40,
  no_idea: 15,
  unknown: 50,
};

export const LABELS = {
  quality: {
    great: "Great",
    good: "Good",
    average: "Average",
    bad: "Bad",
    horrible: "Horrible",
    unknown: "Unknown",
  },
  safety: {
    completely_safe: "Completely Safe",
    quite_safe: "Quite Safe",
    sometimes_safe: "Sometimes Safe",
    not_safe: "Not Safe",
    terrified: "Terrified",
    unknown: "Unknown",
  },
  hazard: {
    poor_garbage_collection: "Poor garbage collection",
    potholes_broken_roads: "Potholes & broken roads",
    petty_crime_unsafe: "Petty crime / unsafe",
    water_logging: "Water logging",
    stray_animals: "Stray animals",
    broken_streetlights: "Broken streetlights",
    lack_of_parks: "Lack of parks",
    other: "Other",
  },
  business: {
    parking_congestion: "Parking congestion",
    lack_public_toilets: "Lack of public toilets",
    harassment_by_administration: "Harassment by administration",
    garbage: "Garbage",
    electricity_tariffs: "Electricity tariffs",
    sealing_threats: "Sealing threats",
    other: "Other",
  },
  emergency: {
    system_works: "System works",
    know_but_ignored: "Know who to call but ignored",
    no_idea: "No idea who to approach",
    unknown: "Unknown",
  },
  news: {
    social_media: "Social media",
    domestic_worker: "Domestic worker",
    rwa: "RWA",
    neighbours: "Neighbours",
    newspapers: "Newspapers",
    other: "Other",
  },
} as const;
