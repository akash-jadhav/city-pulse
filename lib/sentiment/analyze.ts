import type { SentimentSummary, WordFrequency } from "@/types/analytics";

const POSITIVE = [
  "love",
  "safe",
  "clean",
  "peaceful",
  "friendly",
  "accessible",
  "amenities",
  "green",
  "walkable",
  "happy",
  "good",
  "great",
  "beautiful",
];

const NEGATIVE = [
  "hate",
  "dirty",
  "unsafe",
  "pothole",
  "garbage",
  "traffic",
  "congestion",
  "noise",
  "terrible",
  "bad",
  "horrible",
  "crime",
  "water",
  "stray",
  "broken",
  "ugly",
];

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "what",
  "which",
  "who",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "about",
  "area",
  "neighbourhood",
  "neighborhood",
]);

export function simpleSentiment(text: string): {
  label: "positive" | "neutral" | "negative";
  score: number;
} {
  const words = text.toLowerCase().split(/\W+/);
  let pos = 0;
  let neg = 0;
  for (const w of words) {
    if (POSITIVE.includes(w)) pos++;
    if (NEGATIVE.includes(w)) neg++;
  }
  if (pos === 0 && neg === 0) return { label: "neutral", score: 0.5 };
  const score = pos / (pos + neg);
  if (score > 0.6) return { label: "positive", score };
  if (score < 0.4) return { label: "negative", score: 1 - score };
  return { label: "neutral", score: 0.5 };
}

export function aggregateSentiment(texts: string[]): SentimentSummary {
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  for (const text of texts) {
    const { label } = simpleSentiment(text);
    if (label === "positive") positive++;
    else if (label === "negative") negative++;
    else neutral++;
  }
  const total = texts.length || 1;
  return {
    positive: Math.round((positive / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    negative: Math.round((negative / total) * 100),
    total: texts.length,
  };
}

export function extractWordFreq(texts: string[], limit = 40): WordFrequency[] {
  const freq = new Map<string, number>();
  for (const text of texts) {
    const words = text.toLowerCase().match(/[a-z]{3,}/g) ?? [];
    for (const word of words) {
      if (STOPWORDS.has(word)) continue;
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export const TOPIC_KEYWORDS: Record<string, string[]> = {
  Parks: ["park", "green", "tree", "garden"],
  Traffic: ["traffic", "congestion", "road", "parking"],
  Water: ["water", "logging", "rain", "flood"],
  Safety: ["safe", "security", "crime", "patrol"],
  Sanitation: ["garbage", "waste", "dump", "dirty"],
  Power: ["electricity", "power", "voltage", "cut"],
};

export function extractTopics(texts: string[]): { topic: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const text of texts) {
    const lower = text.toLowerCase();
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (keywords.some((k) => lower.includes(k))) {
        counts.set(topic, (counts.get(topic) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}
