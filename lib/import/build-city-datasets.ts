import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import type { CityBounds, SurveyDataset, SurveyResponse } from "@/types/survey";
import type { CitiesManifest } from "@/types/cities-manifest";
import { slugifyCity } from "@/lib/import/slugify-city";

const BOUNDS_PADDING = 0.02;

function computeBounds(responses: SurveyResponse[]): CityBounds {
  const coords = responses
    .map((r) => r.geo.coordinates)
    .filter(Boolean) as { lat: number; lng: number }[];

  if (coords.length === 0) {
    return { north: 28.88, south: 28.4, east: 77.35, west: 76.84 };
  }

  let north = -Infinity;
  let south = Infinity;
  let east = -Infinity;
  let west = Infinity;

  for (const { lat, lng } of coords) {
    north = Math.max(north, lat);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    west = Math.min(west, lng);
  }

  return {
    north: north + BOUNDS_PADDING,
    south: south - BOUNDS_PADDING,
    east: east + BOUNDS_PADDING,
    west: west - BOUNDS_PADDING,
  };
}

function computeCenter(bounds: CityBounds): [number, number] {
  return [
    (bounds.north + bounds.south) / 2,
    (bounds.east + bounds.west) / 2,
  ];
}

function groupByCity(responses: SurveyResponse[]): Map<string, SurveyResponse[]> {
  const groups = new Map<string, SurveyResponse[]>();

  for (const response of responses) {
    const cityName = response.geo.cityName ?? "Unknown";
    const slug = slugifyCity(cityName) || "unknown";
    const list = groups.get(slug) ?? [];
    list.push({
      ...response,
      geo: {
        ...response.geo,
        cityId: slug,
      },
    });
    groups.set(slug, list);
  }

  return groups;
}

export interface BuildCityDatasetsResult {
  manifest: CitiesManifest;
  writtenFiles: string[];
}

export async function buildCityDatasets(
  responses: SurveyResponse[],
  outDir = path.join(process.cwd(), "public", "data")
): Promise<BuildCityDatasetsResult> {
  await mkdir(outDir, { recursive: true });

  const groups = groupByCity(responses);
  const writtenFiles: string[] = [];
  const manifestEntries: CitiesManifest["cities"] = [];

  for (const [slug, cityResponses] of groups) {
    const displayName =
      cityResponses.find((r) => r.geo.cityName)?.geo.cityName ?? slug;
    const bounds = computeBounds(cityResponses);
    const defaultCenter = computeCenter(bounds);

    const payload = JSON.stringify({ responses: cityResponses });
    const checksum = createHash("sha256").update(payload).digest("hex").slice(0, 16);

    const dataset: SurveyDataset = {
      meta: {
        version: "1.0.0",
        cityId: slug,
        importedAt: new Date().toISOString(),
        source: "csv",
        totalResponses: cityResponses.length,
        checksum,
      },
      responses: cityResponses,
    };

    const filePath = path.join(outDir, `${slug}.json`);
    await writeFile(filePath, JSON.stringify(dataset, null, 2));
    writtenFiles.push(filePath);

    manifestEntries.push({
      slug,
      name: displayName,
      defaultCenter,
      bounds,
      responseCount: cityResponses.length,
    });
  }

  manifestEntries.sort((a, b) => b.responseCount - a.responseCount);

  const manifest: CitiesManifest = {
    generatedAt: new Date().toISOString(),
    cities: manifestEntries,
  };

  const manifestPath = path.join(outDir, "cities.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  writtenFiles.push(manifestPath);

  return { manifest, writtenFiles };
}

export function formatCitySummary(manifest: CitiesManifest): string {
  return manifest.cities
    .map((c) => `${c.name} (${c.responseCount})`)
    .join(", ");
}
