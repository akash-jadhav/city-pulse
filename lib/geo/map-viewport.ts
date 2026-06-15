import { getMapBounds } from "@/lib/analytics";
import { DEFAULT_INDIA_ZOOM, DEFAULT_ZOOM } from "@/components/geo/map-config";
import type { CityConfig, SurveyResponse } from "@/types/survey";

export function getMapViewport(
  city: CityConfig,
  responses: SurveyResponse[]
): { center: { lat: number; lng: number }; zoom: number } {
  const defaultZoom = city.defaultZoom ?? DEFAULT_ZOOM;

  if (!city.isAggregate) {
    return {
      center: {
        lat: city.defaultCenter[0],
        lng: city.defaultCenter[1],
      },
      zoom: defaultZoom,
    };
  }

  const bounds = getMapBounds(responses, city.bounds);
  return {
    center: {
      lat: bounds.center[0],
      lng: bounds.center[1],
    },
    zoom: Math.min(defaultZoom, DEFAULT_INDIA_ZOOM),
  };
}
