import type { CityConfig } from "@/types/survey";

export const delhiConfig: CityConfig = {
  id: "delhi",
  name: "Delhi",
  country: "India",
  slug: "delhi",
  timezone: "Asia/Kolkata",
  geoHierarchy: ["ward", "area", "locality", "neighborhood"],
  localityCount: 180,
  defaultCenter: [28.6139, 77.209],
  bounds: {
    north: 28.88,
    south: 28.4,
    east: 77.35,
    west: 76.84,
  },
  dataFile: "/data/delhi.json",
};

export const cities = {
  delhi: delhiConfig,
} as const;

export type CitySlug = keyof typeof cities;

export function getCityConfig(slug: string): CityConfig | undefined {
  return cities[slug as CitySlug];
}
