import type { CityConfig } from "@/types/survey";

export function getCityDropdownLabel(city: CityConfig): string {
  if (city.isAggregate) return "India (all responses)";
  return city.name;
}

export function getStatCardScopeLabel(city: CityConfig): string {
  if (city.isAggregate) return "India";
  return city.name;
}

export function getLocalityCountForScores(
  city: CityConfig,
  responseCount: number
): number {
  if (city.isAggregate) return responseCount;
  return city.localityCount;
}
