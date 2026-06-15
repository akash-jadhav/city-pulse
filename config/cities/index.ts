import { readFile } from "fs/promises";
import path from "path";
import type { CityConfig } from "@/types/survey";
import type { CitiesManifest, CitiesManifestEntry } from "@/types/cities-manifest";
import { delhiConfig } from "@/config/cities/delhi";
import { indiaConfig } from "@/config/cities/india";

const STATIC_DEFAULTS = {
  country: "India",
  timezone: "Asia/Kolkata",
  geoHierarchy: ["ward", "area", "locality", "neighborhood"] as const,
  localityCount: 180,
};

export async function loadCitiesManifest(): Promise<CitiesManifest | null> {
  try {
    const filePath = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      "public",
      "data",
      "cities.json"
    );
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as CitiesManifest;
  } catch {
    return null;
  }
}

export function manifestEntryToCityConfig(
  entry: CitiesManifestEntry
): CityConfig {
  return {
    id: entry.slug,
    name: entry.name,
    slug: entry.slug,
    country: STATIC_DEFAULTS.country,
    timezone: STATIC_DEFAULTS.timezone,
    geoHierarchy: [...STATIC_DEFAULTS.geoHierarchy],
    localityCount: STATIC_DEFAULTS.localityCount,
    defaultCenter: entry.defaultCenter,
    bounds: entry.bounds,
    dataFile: `/data/${entry.slug}.json`,
  };
}

export async function getCityConfig(
  slug: string
): Promise<CityConfig | undefined> {
  if (slug === "india") return indiaConfig;

  const manifest = await loadCitiesManifest();
  const entry = manifest?.cities.find(
    (c) => c.slug === slug && c.slug !== "india"
  );
  if (entry) return manifestEntryToCityConfig(entry);
  if (slug === "delhi") return delhiConfig;
  return undefined;
}

export async function getAllCityConfigs(): Promise<CityConfig[]> {
  const manifest = await loadCitiesManifest();
  const cityEntries =
    manifest?.cities.filter((c) => c.slug !== "india") ?? [];

  if (cityEntries.length === 0) {
    return [indiaConfig, delhiConfig];
  }

  return [indiaConfig, ...cityEntries.map(manifestEntryToCityConfig)];
}

export async function getDefaultCitySlug(): Promise<string> {
  return "india";
}
