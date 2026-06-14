import { mkdir, readFile } from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import type { SurveyDataset, SurveyResponse } from "@/types/survey";
import { isValidDataRow, mapRowToResponse, parseCsv } from "@/lib/import/csv-parser";
import {
  buildCityDatasets,
  formatCitySummary,
} from "@/lib/import/build-city-datasets";
import { enrichResponsesWithCityNames } from "@/lib/import/geocode";

const AREAS: { name: string; lat: number; lng: number }[] = [
  { name: "Malviya Nagar", lat: 28.5373, lng: 77.2142 },
  { name: "Saket", lat: 28.5244, lng: 77.2066 },
  { name: "Dwarka", lat: 28.5921, lng: 77.046 },
  { name: "Rohini", lat: 28.749, lng: 77.067 },
  { name: "Karol Bagh", lat: 28.651, lng: 77.191 },
  { name: "Connaught Place", lat: 28.6315, lng: 77.2167 },
  { name: "Lajpat Nagar", lat: 28.567, lng: 77.243 },
  { name: "Vasant Kunj", lat: 28.524, lng: 77.158 },
  { name: "Mayur Vihar", lat: 28.609, lng: 77.302 },
  { name: "Pitampura", lat: 28.704, lng: 77.131 },
];

const QUALITY: SurveyResponse["electricityRating"][] = [
  "great",
  "good",
  "average",
  "bad",
  "horrible",
];
const SAFETY: SurveyResponse["safetyRating"][] = [
  "completely_safe",
  "quite_safe",
  "sometimes_safe",
  "not_safe",
  "terrified",
];
const AGES = ["18 - 30", "30 - 50", "50+"];
const GENDERS = ["Female", "Male", "Other"];
const HOUSING: SurveyResponse["housingStatus"][] = ["tenant", "homeowner", "other"];
const HAZARDS = [
  "poor_garbage_collection",
  "potholes_broken_roads",
  "water_logging",
  "stray_animals",
  "petty_crime_unsafe",
] as const;
const BUSINESS = [
  "parking_congestion",
  "lack_public_toilets",
  "harassment_by_administration",
] as const;
const EMERGENCY: SurveyResponse["emergencyResponse"][] = [
  "system_works",
  "know_but_ignored",
  "no_idea",
];
const NEWS: SurveyResponse["newsSources"][number][] = [
  "social_media",
  "rwa",
  "neighbours",
  "newspapers",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function jitter(value: number, amount: number) {
  return value + (Math.random() - 0.5) * amount;
}

const SEED_RESPONSES: Omit<SurveyResponse, "id">[] = [
  {
    submittedAt: "2026-06-12T07:47:46.000Z",
    geo: {
      cityId: "delhi",
      cityName: "Delhi",
      coordinates: { lat: 28.5373287, lng: 77.2142358 },
      coordinatesValid: true,
      localityName: "Malviya Nagar",
    },
    demographics: { age: "30 - 50", gender: "Female" },
    housingStatus: "tenant",
    electricityRating: "good",
    electricityComment: "Voltage fluctuations is a problem",
    roadRating: "bad",
    roadComment:
      "Terrible, not maintained, constant construction, bad width & congestion",
    civicHazards: [
      "poor_garbage_collection",
      "potholes_broken_roads",
      "petty_crime_unsafe",
    ],
    safetyRating: "quite_safe",
    safetyComment: "Need more visible patrolling at night",
    businessChallenges: ["parking_congestion", "lack_public_toilets"],
    emergencyResponse: "unknown",
    newsSources: ["domestic_worker"],
    loveText:
      "Amenities are located within walking distance, very accessible.",
    commentsText:
      "Needs more community driven development in the area.",
  },
  {
    submittedAt: "2026-06-12T12:57:38.000Z",
    geo: {
      cityId: "bengaluru",
      cityName: "Bengaluru",
      coordinates: { lat: 12.8863, lng: 77.586091 },
      coordinatesValid: true,
      localityName: "Out of bounds sample",
    },
    demographics: { age: "30 - 50", gender: "Male" },
    housingStatus: "tenant",
    electricityRating: "average",
    electricityComment: "average electricity",
    roadRating: "bad",
    roadComment: "small roads",
    civicHazards: ["water_logging", "stray_animals"],
    safetyRating: "quite_safe",
    safetyComment: "security concerns in some lanes",
    businessChallenges: ["parking_congestion", "harassment_by_administration"],
    businessComment: "Need better vendor policies",
    emergencyResponse: "system_works",
    newsSources: ["social_media"],
    loveText: "Friendly neighbours and local markets",
    commentsText: "Would like better street lighting",
  },
];

function generateSynthetic(index: number): SurveyResponse {
  const area = pick(AREAS);
  const coords = {
    lat: jitter(area.lat, 0.015),
    lng: jitter(area.lng, 0.015),
  };
  const hazardCount = Math.floor(Math.random() * 3) + 1;
  const hazards = [...HAZARDS].sort(() => Math.random() - 0.5).slice(0, hazardCount);

  return {
    id: `mock-${index}`,
    submittedAt: new Date(
      Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
    ).toISOString(),
    geo: {
      cityId: "delhi",
      cityName: "Delhi",
      coordinates: coords,
      coordinatesValid: true,
      localityName: area.name,
    },
    demographics: { age: pick(AGES), gender: pick(GENDERS) },
    housingStatus: pick(HOUSING),
    electricityRating: pick(QUALITY),
    electricityComment:
      Math.random() > 0.6 ? "Power cuts during summer evenings" : undefined,
    roadRating: pick(QUALITY),
    roadComment: Math.random() > 0.6 ? "Congestion during peak hours" : undefined,
    civicHazards: [...hazards],
    safetyRating: pick(SAFETY),
    safetyComment: Math.random() > 0.7 ? "Would like more patrolling" : undefined,
    businessChallenges:
      Math.random() > 0.5 ? [pick([...BUSINESS])] : [],
    emergencyResponse: pick(EMERGENCY),
    newsSources: [pick(NEWS)],
    loveText:
      Math.random() > 0.4
        ? `I appreciate the community spirit in ${area.name}`
        : undefined,
    commentsText:
      Math.random() > 0.5
        ? "Hope civic services improve in the next year"
        : undefined,
  };
}

export function buildMockDataset(count = 120): SurveyDataset {
  const responses: SurveyResponse[] = [
    ...SEED_RESPONSES.map((r, i) => ({ ...r, id: `seed-${i}` })),
    ...Array.from({ length: count - SEED_RESPONSES.length }, (_, i) =>
      generateSynthetic(i)
    ),
  ];

  const payload = JSON.stringify({ responses });
  const checksum = createHash("sha256").update(payload).digest("hex").slice(0, 16);

  return {
    meta: {
      version: "1.0.0",
      cityId: "delhi",
      importedAt: new Date().toISOString(),
      source: "mock",
      totalResponses: responses.length,
      checksum,
    },
    responses,
  };
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "data");
  await mkdir(outDir, { recursive: true });
  const dataset = buildMockDataset(120);
  const { manifest, writtenFiles } = await buildCityDatasets(
    dataset.responses,
    outDir
  );
  console.log(
    `Generated ${dataset.meta.totalResponses} responses → ${manifest.cities.length} cities: ${formatCitySummary(manifest)}`
  );
  console.log(`Wrote ${writtenFiles.join(", ")}`);
}

async function importCsv(csvPath: string) {
  const content = await readFile(csvPath, "utf-8");
  const rows = parseCsv(content);
  const skipped = rows.length - rows.filter(isValidDataRow).length;
  const validRows = rows.filter(isValidDataRow);
  const mapped = validRows.map((row, i) => mapRowToResponse(row, i));
  const responses = await enrichResponsesWithCityNames(mapped);
  const { manifest, writtenFiles } = await buildCityDatasets(responses);

  console.log(
    `Geocoded ${responses.length} responses → ${manifest.cities.length} cities: ${formatCitySummary(manifest)}`
  );
  console.log(`Wrote ${writtenFiles.join(", ")}`);

  if (skipped > 0) {
    console.log(`Skipped ${skipped} rows (Valid Data = No).`);
  }
}

const arg = process.argv[2];
if (arg === "--csv" && process.argv[3]) {
  importCsv(process.argv[3]).catch(console.error);
} else {
  main().catch(console.error);
}
