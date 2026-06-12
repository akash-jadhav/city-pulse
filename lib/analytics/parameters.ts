import type { SurveyResponse } from "@/types/survey";
import {
  EMERGENCY_SCORES,
  QUALITY_SCORES,
  SAFETY_SCORES,
} from "@/lib/import/normalize";
import { simpleSentiment } from "@/lib/sentiment/analyze";
import { computeScoresCore } from "@/lib/analytics/index";

export type ScoreTier =
  | "very_good"
  | "good"
  | "average"
  | "poor"
  | "very_poor";

export type ParameterId =
  | "overall"
  | "safety"
  | "electricity"
  | "roads"
  | "infrastructure"
  | "civic_services"
  | "community";

export interface ParameterAverage {
  id: ParameterId;
  label: string;
  icon: string;
  color: string;
  score100: number;
  scoreFive: number;
  tier: ScoreTier;
  badge: string;
}

export interface DistributionSegment {
  tier: ScoreTier;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export const TIER_COLORS: Record<ScoreTier, string> = {
  very_good: "#15803d",
  good: "#22c55e",
  average: "#eab308",
  poor: "#f97316",
  very_poor: "#ef4444",
};

export const TIER_LABELS: Record<ScoreTier, string> = {
  very_good: "Very Good",
  good: "Good",
  average: "Average",
  poor: "Poor",
  very_poor: "Very Poor",
};

export const BADGE_LABELS: Record<ScoreTier, string> = {
  very_good: "Very Good",
  good: "Good",
  average: "Moderate",
  poor: "Poor",
  very_poor: "Very Poor",
};

export const LEGEND_TIERS: { tier: ScoreTier; range: string }[] = [
  { tier: "very_good", range: "4.1 – 5.0" },
  { tier: "good", range: "3.1 – 4.0" },
  { tier: "average", range: "2.1 – 3.0" },
  { tier: "poor", range: "1.1 – 2.0" },
  { tier: "very_poor", range: "0 – 1.0" },
];

export function scoreToFive(score100: number): number {
  return Math.round((score100 / 20) * 10) / 10;
}

export function scoreToTier(score100: number): ScoreTier {
  const five = score100 / 20;
  if (five >= 4.1) return "very_good";
  if (five >= 3.1) return "good";
  if (five >= 2.1) return "average";
  if (five >= 1.1) return "poor";
  return "very_poor";
}

export function tierColor(tier: ScoreTier): string {
  return TIER_COLORS[tier];
}

export function tierLabel(tier: ScoreTier): string {
  return TIER_LABELS[tier];
}

function responseSatisfaction(r: SurveyResponse): number {
  const texts = [r.loveText, r.commentsText, r.safetyComment].filter(Boolean) as string[];
  if (texts.length === 0) {
    return (
      (SAFETY_SCORES[r.safetyRating] +
        QUALITY_SCORES[r.electricityRating] +
        QUALITY_SCORES[r.roadRating]) /
      3
    );
  }
  const avg = texts.reduce((s, t) => s + simpleSentiment(t).score, 0) / texts.length;
  return avg * 100;
}

function responseInfrastructure(r: SurveyResponse): number {
  const elec = QUALITY_SCORES[r.electricityRating];
  const road = QUALITY_SCORES[r.roadRating];
  const penalty = r.civicHazards.length * 5;
  return Math.max(0, ((elec + road) / 2) * 0.7 + Math.max(0, 30 - penalty));
}

function responseCivicServices(r: SurveyResponse): number {
  const emergency = EMERGENCY_SCORES[r.emergencyResponse];
  const penalty = r.civicHazards.length * 2.5;
  return Math.max(0, emergency - penalty);
}

function responseOverall(r: SurveyResponse): number {
  const safety = SAFETY_SCORES[r.safetyRating];
  const infra = responseInfrastructure(r);
  const civic = responseCivicServices(r);
  const community = responseSatisfaction(r);
  return safety * 0.25 + infra * 0.3 + civic * 0.25 + community * 0.2;
}

export function getResponseScore(
  response: SurveyResponse,
  paramId: ParameterId
): number {
  switch (paramId) {
    case "safety":
      return SAFETY_SCORES[response.safetyRating];
    case "electricity":
      return QUALITY_SCORES[response.electricityRating];
    case "roads":
      return QUALITY_SCORES[response.roadRating];
    case "infrastructure":
      return responseInfrastructure(response);
    case "civic_services":
      return responseCivicServices(response);
    case "community":
      return responseSatisfaction(response);
    case "overall":
    default:
      return responseOverall(response);
  }
}

export function getParameterAverages(
  responses: SurveyResponse[]
): ParameterAverage[] {
  if (responses.length === 0) return [];

  const core = computeScoresCore(responses);

  const defs: Omit<ParameterAverage, "score100" | "scoreFive" | "tier" | "badge">[] = [
    { id: "overall", label: "Overall Quality of Life", icon: "sparkles", color: "#6366f1" },
    { id: "safety", label: "Safety", icon: "shield", color: "#8b5cf6" },
    { id: "electricity", label: "Electricity", icon: "zap", color: "#f59e0b" },
    { id: "roads", label: "Road Quality", icon: "route", color: "#f97316" },
    { id: "infrastructure", label: "Infrastructure", icon: "building", color: "#14b8a6" },
    { id: "civic_services", label: "Civic Services", icon: "landmark", color: "#3b82f6" },
    { id: "community", label: "Community", icon: "heart", color: "#ec4899" },
  ];

  const scoreMap: Record<ParameterId, number> = {
    overall: core.overall,
    safety: core.safety,
    electricity: Math.round(
      responses.reduce((s, r) => s + QUALITY_SCORES[r.electricityRating], 0) /
        responses.length
    ),
    roads: Math.round(
      responses.reduce((s, r) => s + QUALITY_SCORES[r.roadRating], 0) /
        responses.length
    ),
    infrastructure: core.infrastructure,
    civic_services: core.civicReliability,
    community: core.satisfaction,
  };

  return defs.map((d) => {
    const score100 = scoreMap[d.id];
    const tier = scoreToTier(score100);
    return {
      ...d,
      score100,
      scoreFive: scoreToFive(score100),
      tier,
      badge: BADGE_LABELS[tier],
    };
  });
}

export function getScoreDistribution(
  responses: SurveyResponse[]
): DistributionSegment[] {
  const counts: Record<ScoreTier, number> = {
    very_good: 0,
    good: 0,
    average: 0,
    poor: 0,
    very_poor: 0,
  };

  for (const r of responses) {
    const tier = scoreToTier(getResponseScore(r, "overall"));
    counts[tier]++;
  }

  const total = responses.length || 1;
  return (Object.keys(counts) as ScoreTier[]).map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    count: counts[tier],
    percent: Math.round((counts[tier] / total) * 100),
    color: TIER_COLORS[tier],
  }));
}
