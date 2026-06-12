export interface AggregatedScores {
  overall: number;
  safety: number;
  infrastructure: number;
  civicReliability: number;
  satisfaction: number;
  responseCount: number;
  coveragePercent: number;
}

export interface RankedIssue {
  id: string;
  label: string;
  count: number;
  percent: number;
  severity: "low" | "medium" | "high";
}

export interface GeoCluster {
  id: string;
  label: string;
  lat: number;
  lng: number;
  responseCount: number;
  scores: AggregatedScores;
  responses: string[];
}

export interface ComparisonResult {
  dimension: string;
  baseline: number;
  target: number;
  delta: number;
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface WordFrequency {
  word: string;
  count: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  center: [number, number];
}
