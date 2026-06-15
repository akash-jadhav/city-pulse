import type { CityConfig } from "@/types/survey";

export const indiaConfig: CityConfig = {
  id: "india",
  name: "India",
  country: "India",
  slug: "india",
  timezone: "Asia/Kolkata",
  geoHierarchy: ["ward", "area", "locality", "neighborhood"],
  localityCount: 1000,
  defaultCenter: [22.9734, 78.6569],
  bounds: {
    north: 37.6,
    south: 6.4,
    east: 97.4,
    west: 68.1,
  },
  defaultZoom: 4.5,
  isAggregate: true,
  dataFile: "/data/india.json",
};

export const INDIA_MANIFEST_ENTRY = {
  slug: "india",
  name: "India",
  defaultCenter: indiaConfig.defaultCenter,
  bounds: indiaConfig.bounds,
} as const;
