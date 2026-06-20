import { DEFAULT_ZOOM } from "@/components/geo/map-config";
import type { CityConfig, SurveyResponse } from "@/types/survey";

export function getMapViewport(
  city: CityConfig,
  _responses: SurveyResponse[]
): { center: { lat: number; lng: number }; zoom: number } {
  const defaultZoom = city.defaultZoom ?? DEFAULT_ZOOM;

  return {
    center: {
      lat: city.defaultCenter[0],
      lng: city.defaultCenter[1],
    },
    zoom: defaultZoom,
  };
}
