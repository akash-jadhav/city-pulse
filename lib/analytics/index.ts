import type {
  AggregatedScores,
  GeoCluster,
  MapBounds,
  RankedIssue,
} from "@/types/analytics";
import type { CityBounds, SurveyResponse } from "@/types/survey";
import {
  EMERGENCY_SCORES,
  QUALITY_SCORES,
  SAFETY_SCORES,
  LABELS,
} from "@/lib/import/normalize";
import { simpleSentiment } from "@/lib/sentiment/analyze";

export function qualityScore(rating: keyof typeof QUALITY_SCORES): number {
  return QUALITY_SCORES[rating];
}

export function safetyScore(rating: keyof typeof SAFETY_SCORES): number {
  return SAFETY_SCORES[rating];
}

export function computeScoresCore(
  responses: SurveyResponse[]
): Omit<AggregatedScores, "coveragePercent"> {
  if (responses.length === 0) {
    return {
      overall: 0,
      safety: 0,
      infrastructure: 0,
      civicReliability: 0,
      satisfaction: 0,
      responseCount: 0,
    };
  }

  const safety =
    responses.reduce((sum, r) => sum + SAFETY_SCORES[r.safetyRating], 0) /
    responses.length;

  const electricityAvg =
    responses.reduce((sum, r) => sum + QUALITY_SCORES[r.electricityRating], 0) /
    responses.length;
  const roadAvg =
    responses.reduce((sum, r) => sum + QUALITY_SCORES[r.roadRating], 0) /
    responses.length;

  const hazardPenalty =
    responses.reduce((sum, r) => sum + r.civicHazards.length * 5, 0) /
    responses.length;
  const infrastructure = Math.max(
    0,
    ((electricityAvg + roadAvg) / 2) * 0.7 + Math.max(0, 30 - hazardPenalty)
  );

  const emergencyAvg =
    responses.reduce((sum, r) => sum + EMERGENCY_SCORES[r.emergencyResponse], 0) /
    responses.length;
  const civicReliability = Math.max(0, emergencyAvg - hazardPenalty * 0.5);

  const textFields = responses.flatMap((r) =>
    [r.loveText, r.commentsText, r.electricityComment, r.roadComment, r.safetyComment]
      .filter(Boolean) as string[]
  );
  const sentimentScores = textFields.map((t) => simpleSentiment(t).score);
  const satisfaction =
    sentimentScores.length > 0
      ? (sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length) * 100
      : (safety + infrastructure) / 2;

  const overall =
    safety * 0.25 +
    infrastructure * 0.3 +
    civicReliability * 0.25 +
    satisfaction * 0.2;

  return {
    overall: Math.round(overall),
    safety: Math.round(safety),
    infrastructure: Math.round(infrastructure),
    civicReliability: Math.round(civicReliability),
    satisfaction: Math.round(satisfaction),
    responseCount: responses.length,
  };
}

export function computeScores(
  responses: SurveyResponse[],
  localityCount = 180
): AggregatedScores {
  if (responses.length === 0) {
    return {
      overall: 0,
      safety: 0,
      infrastructure: 0,
      civicReliability: 0,
      satisfaction: 0,
      responseCount: 0,
      coveragePercent: 0,
    };
  }

  const core = computeScoresCore(responses);
  const clusters = clusterByCoordinates(responses, 0.02);
  const coveredClusters = clusters.filter((c) => c.responseCount >= 5).length;

  return {
    ...core,
    coveragePercent: Math.round((coveredClusters / localityCount) * 100),
  };
}

export function rankIssues(
  responses: SurveyResponse[],
  field: "civicHazards" | "businessChallenges" = "civicHazards"
): RankedIssue[] {
  const counts = new Map<string, number>();
  for (const r of responses) {
    for (const item of r[field]) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }

  const labelMap =
    field === "civicHazards" ? LABELS.hazard : LABELS.business;

  return [...counts.entries()]
    .map(([id, count]) => ({
      id,
      label: labelMap[id as keyof typeof labelMap] ?? id,
      count,
      percent: Math.round((count / responses.length) * 100),
      severity: (count / responses.length > 0.4
        ? "high"
        : count / responses.length > 0.2
          ? "medium"
          : "low") as RankedIssue["severity"],
    }))
    .sort((a, b) => b.count - a.count);
}

export function distribution(
  responses: SurveyResponse[],
  getter: (r: SurveyResponse) => string
): { label: string; count: number; percent: number }[] {
  const counts = new Map<string, number>();
  for (const r of responses) {
    const key = getter(r);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / responses.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function clusterByCoordinates(
  responses: SurveyResponse[],
  gridSize = 0.02
): GeoCluster[] {
  const buckets = new Map<string, SurveyResponse[]>();

  for (const r of responses) {
    if (!r.geo.coordinatesValid || !r.geo.coordinates) continue;
    const { lat, lng } = r.geo.coordinates;
    const key = `${Math.round(lat / gridSize)}_${Math.round(lng / gridSize)}`;
    const list = buckets.get(key) ?? [];
    list.push(r);
    buckets.set(key, list);
  }

  return [...buckets.entries()].map(([key, clusterResponses]) => {
    const avgLat =
      clusterResponses.reduce((s, r) => s + r.geo.coordinates!.lat, 0) /
      clusterResponses.length;
    const avgLng =
      clusterResponses.reduce((s, r) => s + r.geo.coordinates!.lng, 0) /
      clusterResponses.length;

    const localityNames = [
      ...new Set(
        clusterResponses
          .map((r) => r.geo.localityName)
          .filter(Boolean) as string[]
      ),
    ];
    const label =
      localityNames.length > 0
        ? localityNames[0]
        : `Grid ${key.replace("_", ", ")}`;

    return {
      id: key,
      label,
      lat: avgLat,
      lng: avgLng,
      responseCount: clusterResponses.length,
      scores: {
        ...computeScoresCore(clusterResponses),
        coveragePercent: 0,
      },
      responses: clusterResponses.map((r) => r.id),
    };
  });
}

export function getMapBounds(
  responses: SurveyResponse[],
  fallback: CityBounds
): MapBounds {
  const valid = responses.filter(
    (r) => r.geo.coordinatesValid && r.geo.coordinates
  );
  if (valid.length === 0) {
    return {
      ...fallback,
      center: [
        (fallback.north + fallback.south) / 2,
        (fallback.east + fallback.west) / 2,
      ],
    };
  }

  let north = -Infinity;
  let south = Infinity;
  let east = -Infinity;
  let west = Infinity;

  for (const r of valid) {
    const { lat, lng } = r.geo.coordinates!;
    north = Math.max(north, lat);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    west = Math.min(west, lng);
  }

  return {
    north,
    south,
    east,
    west,
    center: [(north + south) / 2, (east + west) / 2],
  };
}

export function compareToBaseline(
  target: AggregatedScores,
  baseline: AggregatedScores
): { dimension: string; baseline: number; target: number; delta: number }[] {
  const dims: (keyof AggregatedScores)[] = [
    "overall",
    "safety",
    "infrastructure",
    "civicReliability",
    "satisfaction",
  ];
  return dims.map((d) => ({
    dimension: d.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    baseline: baseline[d] as number,
    target: target[d] as number,
    delta: (target[d] as number) - (baseline[d] as number),
  }));
}

export function getStrengthsAndConcerns(responses: SurveyResponse[]) {
  const issues = rankIssues(responses);
  const concerns = issues.slice(0, 5);
  const clusters = clusterByCoordinates(responses).sort(
    (a, b) => b.scores.overall - a.scores.overall
  );
  const strengths = clusters.slice(0, 3).map((c) => ({
    label: `High-scoring area (${c.responseCount} responses)`,
    score: c.scores.overall,
  }));
  return { strengths, concerns };
}

export function filterValidMapResponses(responses: SurveyResponse[]) {
  return responses.filter((r) => r.geo.coordinatesValid && r.geo.coordinates);
}

export function getQuotes(responses: SurveyResponse[], limit = 5): string[] {
  const quotes: string[] = [];
  for (const r of responses) {
    for (const text of [
      r.loveText,
      r.commentsText,
      r.electricityComment,
      r.roadComment,
      r.safetyComment,
    ]) {
      if (text && text.length > 20) quotes.push(text.slice(0, 200));
    }
  }
  return quotes.slice(0, limit);
}
