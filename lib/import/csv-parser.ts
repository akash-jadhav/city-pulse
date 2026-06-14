import type { SurveyResponse } from "@/types/survey";
import { parseCoordinates } from "@/lib/import/parse-coordinates";
import {
  normalizeBusinessChallenges,
  normalizeCivicHazards,
  normalizeEmergencyResponse,
  normalizeHousingStatus,
  normalizeNewsSources,
  normalizeQualityRating,
  normalizeSafetyRating,
} from "@/lib/import/normalize";

function findColumn(row: Record<string, string>, ...needles: string[]): string {
  const keys = Object.keys(row);
  for (const needle of needles) {
    const key = keys.find((k) =>
      k.toLowerCase().includes(needle.toLowerCase())
    );
    if (key) return row[key] ?? "";
  }
  return "";
}

export function isValidDataRow(row: Record<string, string>): boolean {
  const value = findColumn(row, "valid data").trim().toLowerCase();
  return value !== "no";
}

export function mapRowToResponse(
  row: Record<string, string>,
  index: number,
  cityId = "delhi"
): SurveyResponse {
  const coordsRaw = findColumn(
    row,
    "latitude and longitude",
    "location of where this survey"
  );
  const coords = parseCoordinates(coordsRaw);
  const coordinatesValid = Boolean(coords);

  const timestamp = findColumn(row, "timestamp") || new Date().toISOString();

  return {
    id: `resp-${index}-${Date.now()}`,
    submittedAt: new Date(timestamp).toISOString(),
    geo: {
      cityId,
      coordinates: coords ?? undefined,
      coordinatesValid,
    },
    demographics: {
      age: findColumn(row, "age of respondent") || undefined,
      gender: findColumn(row, "gender of respondent") || undefined,
    },
    housingStatus: normalizeHousingStatus(
      findColumn(row, "tenant or a homeowner", "tenant or homeowner")
    ),
    electricityRating: normalizeQualityRating(
      findColumn(row, "quality of electricity")
    ),
    electricityComment:
      findColumn(row, "comment on electricity") || undefined,
    roadRating: normalizeQualityRating(findColumn(row, "quality of roads")),
    roadComment: findColumn(row, "comment on quality of roads") || undefined,
    civicHazards: normalizeCivicHazards(
      findColumn(row, "civic hazards", "biggest civic")
    ),
    safetyRating: normalizeSafetyRating(
      findColumn(row, "walking alone", "after dark")
    ),
    safetyComment:
      findColumn(row, "comment on security", "comment on security and safety") ||
      undefined,
    businessChallenges: normalizeBusinessChallenges(
      findColumn(row, "infrastructural barrier", "business owners")
    ),
    businessComment:
      findColumn(row, "change in the area which helps you run") || undefined,
    emergencyResponse: normalizeEmergencyResponse(
      findColumn(row, "civic emergency")
    ),
    newsSources: normalizeNewsSources(
      findColumn(row, "primary source for local")
    ),
    loveText: findColumn(row, "love about your neighbourhood", "love about your neighborhood") || undefined,
    commentsText:
      findColumn(row, "anything else you would like to share") || undefined,
  };
}

export function parseCsv(content: string): Record<string, string>[] {
  const lines: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      current.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      current.push(field);
      if (current.some((c) => c.trim())) lines.push(current);
      current = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || current.length) {
    current.push(field);
    if (current.some((c) => c.trim())) lines.push(current);
  }

  if (lines.length < 2) return [];
  const headers = lines[0];
  return lines.slice(1).map((cells) => {
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.trim()] = (cells[i] ?? "").trim();
    });
    return row;
  });
}
