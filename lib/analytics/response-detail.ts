import type { SurveyResponse } from "@/types/survey";
import {
  EMERGENCY_SCORES,
  LABELS,
  QUALITY_SCORES,
  SAFETY_SCORES,
} from "@/lib/import/normalize";
import { getResponseScore, scoreToFive, scoreToTier, tierLabel } from "@/lib/analytics/parameters";

export interface ResponseDetailSection {
  label: string;
  stars?: string;
  testimonial?: string;
}

export function scoreToStarString(score100: number): string {
  const count = Math.min(5, Math.max(1, Math.round(score100 / 20)));
  return "⭐".repeat(count);
}

function pushSection(
  sections: ResponseDetailSection[],
  label: string,
  stars?: string,
  testimonial?: string
) {
  const text = testimonial?.trim();
  if (!stars && !text) return;
  sections.push({
    label,
    stars,
    testimonial: text || undefined,
  });
}

export function buildResponseDetailSections(
  response: SurveyResponse
): ResponseDetailSection[] {
  const sections: ResponseDetailSection[] = [];

  pushSection(
    sections,
    "Electricity",
    scoreToStarString(QUALITY_SCORES[response.electricityRating]),
    response.electricityComment
  );

  pushSection(
    sections,
    "Roads",
    scoreToStarString(QUALITY_SCORES[response.roadRating]),
    response.roadComment
  );

  pushSection(
    sections,
    "Safety",
    scoreToStarString(SAFETY_SCORES[response.safetyRating]),
    response.safetyComment
  );

  if (response.civicHazards.length > 0) {
    pushSection(
      sections,
      "Civic hazards",
      undefined,
      response.civicHazards
        .map((h) => LABELS.hazard[h])
        .join(", ")
    );
  }

  const businessParts = [
    response.businessChallenges.length > 0
      ? response.businessChallenges
          .map((c) => LABELS.business[c])
          .join(", ")
      : "",
    response.businessComment?.trim() ?? "",
  ].filter(Boolean);

  if (businessParts.length > 0) {
    pushSection(sections, "Business", undefined, businessParts.join(". "));
  }

  pushSection(
    sections,
    "Emergency response",
    scoreToStarString(EMERGENCY_SCORES[response.emergencyResponse]),
    undefined
  );

  pushSection(sections, "What they love", undefined, response.loveText);
  pushSection(sections, "Other comments", undefined, response.commentsText);

  return sections;
}

export function getResponseAverageHeader(response: SurveyResponse) {
  const score100 = getResponseScore(response, "overall");
  return {
    scoreFive: scoreToFive(score100),
    tier: tierLabel(scoreToTier(score100)),
    stars: scoreToStarString(score100),
  };
}

export function getResponseOverallStars(response: SurveyResponse): string {
  return scoreToStarString(getResponseScore(response, "overall"));
}

export function getResponseHoverLabel(response: SurveyResponse): string {
  return (
    response.geo.localityName ??
    response.geo.cityName ??
    "Survey point"
  );
}
