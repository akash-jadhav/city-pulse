import type { SurveyResponse } from "@/types/survey";

const UNKNOWN_CITY = "Unknown";

interface GeocodeAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResult {
  address_components: GeocodeAddressComponent[];
}

interface GeocodeApiResponse {
  status: string;
  results?: GeocodeResult[];
  error_message?: string;
}

const cityCache = new Map<string, string>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

export function extractCityName(result: GeocodeResult): string | null {
  const components = result.address_components;

  const locality = components.find((c) => c.types.includes("locality"));
  if (locality) return locality.long_name;

  const district = components.find((c) =>
    c.types.includes("administrative_area_level_2")
  );
  if (district) return district.long_name;

  return null;
}

export function getGeocodingApiKey(): string | undefined {
  return (
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  );
}

export async function reverseGeocodeCity(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string> {
  const key = cacheKey(lat, lng);
  const cached = cityCache.get(key);
  if (cached) return cached;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Geocoding HTTP ${res.status}`);
  }

  const data = (await res.json()) as GeocodeApiResponse;
  if (data.status !== "OK" || !data.results?.length) {
    cityCache.set(key, UNKNOWN_CITY);
    return UNKNOWN_CITY;
  }

  const cityName = extractCityName(data.results[0]) ?? UNKNOWN_CITY;
  cityCache.set(key, cityName);
  return cityName;
}

export async function enrichResponsesWithCityNames(
  responses: SurveyResponse[]
): Promise<SurveyResponse[]> {
  const apiKey = getGeocodingApiKey();
  if (!apiKey) {
    console.warn(
      "GOOGLE_MAPS_API_KEY not set — city names will be Unknown. Add it to .env.local and enable Geocoding API."
    );
    return responses.map((r) => ({
      ...r,
      geo: {
        ...r.geo,
        cityName: r.geo.coordinates ? UNKNOWN_CITY : undefined,
        coordinatesValid: Boolean(r.geo.coordinates),
      },
    }));
  }

  const enriched: SurveyResponse[] = [];

  for (const response of responses) {
    const coords = response.geo.coordinates;
    if (!coords) {
      enriched.push({
        ...response,
        geo: {
          ...response.geo,
          coordinatesValid: false,
        },
      });
      continue;
    }

    const cityName = await reverseGeocodeCity(coords.lat, coords.lng, apiKey);
    enriched.push({
      ...response,
      geo: {
        ...response.geo,
        cityName,
        coordinatesValid: true,
      },
    });
  }

  return enriched;
}

export function clearGeocodeCache(): void {
  cityCache.clear();
}
