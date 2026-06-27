"use client";

import { useCallback, useMemo, useState } from "react";
import { Map as GoogleMap } from "@vis.gl/react-google-maps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SurveyResponse } from "@/types/survey";
import {
  type ParameterId,
  getParameterAverages,
  getResponseScore,
  scoreToFive,
  scoreToTier,
  tierColor,
  tierLabel,
} from "@/lib/analytics/parameters";
import {
  buildResponseDetailSections,
  getResponseAverageHeader,
  getResponseHoverLabel,
} from "@/lib/analytics/response-detail";
import { filterValidMapResponses } from "@/lib/analytics";
import { useCity } from "@/providers/CityProvider";
import { getMapViewport } from "@/lib/geo/map-viewport";
import { DEFAULT_MAP_OPTIONS, DOT_PIXEL_RADIUS } from "@/components/geo/map-config";
import {
  GoogleMapMissingKey,
  MapHoverDismissProvider,
  MapInfoWindow,
  MapShell,
  MapTouchDismiss,
  type MapPoint,
  type MapPopupState,
  TierCircles,
  useGoogleMapsReady,
  useTouchOnlyMap,
} from "@/components/geo/google-map-shared";

interface PulseMapProps {
  responses: SurveyResponse[];
  selectedParameter: ParameterId;
  onParameterChange: (id: ParameterId) => void;
  className?: string;
}

export function PulseMap({
  responses,
  selectedParameter,
  onParameterChange,
  className,
}: PulseMapProps) {
  const city = useCity();
  const mapsReady = useGoogleMapsReady();
  const touchOnly = useTouchOnlyMap();
  const [popup, setPopup] = useState<MapPopupState | null>(null);
  const parameters = useMemo(() => getParameterAverages(responses), [responses]);
  const valid = useMemo(() => filterValidMapResponses(responses), [responses]);
  const mapViewport = useMemo(
    () => getMapViewport(city, responses),
    [city, responses]
  );

  const responseById = useMemo(
    () => new Map(valid.map((response) => [response.id, response])),
    [valid]
  );

  const points = useMemo((): MapPoint[] => {
    return valid.map((r) => {
      const score = getResponseScore(r, selectedParameter);
      const tier = scoreToTier(score);
      return {
        id: r.id,
        responseId: r.id,
        lat: r.geo.coordinates!.lat,
        lng: r.geo.coordinates!.lng,
        color: tierColor(tier),
        radiusPixels: DOT_PIXEL_RADIUS,
        strokeWeight: 1.5,
        label: getResponseHoverLabel(r),
        scoreFive: scoreToFive(score),
        tier: tierLabel(tier),
        responseCount: 1,
      };
    });
  }, [valid, selectedParameter]);

  const showResponsePopup = useCallback(
    (point: MapPoint) => {
      const response = point.responseId
        ? responseById.get(point.responseId)
        : undefined;
      if (!response) return;

      const avg = getResponseAverageHeader(response);

      setPopup({
        lat: point.lat,
        lng: point.lng,
        label: getResponseHoverLabel(response),
        averageScoreFive: avg.scoreFive,
        averageTier: avg.tier,
        overallStars: avg.stars,
        sections: buildResponseDetailSections(response),
      });
    },
    [responseById]
  );

  const handlePointHover = useCallback(
    (point: MapPoint | null) => {
      if (touchOnly) return;
      if (!point) {
        setPopup(null);
        return;
      }
      showResponsePopup(point);
    },
    [showResponsePopup, touchOnly]
  );

  const handlePointClick = useCallback(
    (point: MapPoint) => {
      if (!touchOnly) return;
      showResponsePopup(point);
    },
    [showResponsePopup, touchOnly]
  );

  const clearPopup = useCallback(() => setPopup(null), []);

  if (!mapsReady) {
    return <GoogleMapMissingKey className={className} />;
  }

  if (valid.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-border/50 bg-card text-sm text-muted-foreground shadow-sm ${className ?? ""}`}
      >
        No valid coordinates to display
      </div>
    );
  }

  return (
    <MapShell className={className}>
      <div className="absolute left-3 top-3 z-10 w-52">
        <Select
          value={selectedParameter}
          onValueChange={(v) => v && onParameterChange(v as ParameterId)}
        >
          <SelectTrigger className="border-0 bg-background/95 shadow-md backdrop-blur-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {parameters.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="absolute right-3 top-3 z-10 rounded-lg bg-background/95 px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur-sm">
        {city.name}
      </div>

      <GoogleMap
        defaultCenter={mapViewport.center}
        defaultZoom={mapViewport.zoom}
        {...DEFAULT_MAP_OPTIONS}
        style={{ width: "100%", height: "100%" }}
      >
        <MapHoverDismissProvider onDismiss={clearPopup}>
          <TierCircles
            points={points}
            onPointHover={handlePointHover}
            onPointClick={handlePointClick}
          />
          <MapTouchDismiss enabled={touchOnly} onClear={clearPopup} />
          <MapInfoWindow popup={popup} />
        </MapHoverDismissProvider>
      </GoogleMap>
    </MapShell>
  );
}
