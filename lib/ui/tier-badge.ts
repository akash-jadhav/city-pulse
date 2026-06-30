import type { ScoreTier } from "@/lib/analytics/parameters";

export const TIER_BADGE_CLASS: Record<ScoreTier, string> = {
  very_good:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  good: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  average:
    "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400",
  poor: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  very_poor: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

export function tierBadgeClassForTier(tier: ScoreTier): string {
  return TIER_BADGE_CLASS[tier];
}

/** Maps display labels like "Very Good" or "Moderate" to badge classes. */
export function tierBadgeClassFromLabel(tierLabel: string): string {
  const lower = tierLabel.toLowerCase();

  if (lower.includes("very good") || lower.includes("very_good")) {
    return TIER_BADGE_CLASS.very_good;
  }
  if (lower.includes("good")) {
    return TIER_BADGE_CLASS.good;
  }
  if (lower.includes("average") || lower.includes("moderate")) {
    return TIER_BADGE_CLASS.average;
  }
  if (lower.includes("very poor") || lower.includes("very_poor")) {
    return TIER_BADGE_CLASS.very_poor;
  }
  if (lower.includes("poor")) {
    return TIER_BADGE_CLASS.poor;
  }

  return TIER_BADGE_CLASS.average;
}
