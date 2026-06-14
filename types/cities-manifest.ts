import type { CityBounds } from "@/types/survey";

export interface CitiesManifestEntry {
  slug: string;
  name: string;
  defaultCenter: [number, number];
  bounds: CityBounds;
  responseCount: number;
}

export interface CitiesManifest {
  generatedAt: string;
  cities: CitiesManifestEntry[];
}
