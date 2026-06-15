"use client";

import { useMemo, useState } from "react";
import { Map } from "@vis.gl/react-google-maps";
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
import { filterValidMapResponses } from "@/lib/analytics";
import { useCity } from "@/providers/CityProvider";
import { getMapViewport } from "@/lib/geo/map-viewport";
import { DEFAULT_MAP_OPTIONS, DOT_PIXEL_RADIUS } from "@/components/geo/map-config";
import {
  GoogleMapMissingKey,
  MapInfoWindow,
  MapShell,
  type MapPoint,
  type MapPopupState,
  TierCircles,
  useGoogleMapsReady,
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
  const [popup, setPopup] = useState<MapPopupState | null>(null);
  const parameters = useMemo(() => getParameterAverages(responses), [responses]);
  const valid = useMemo(() => filterValidMapResponses(responses), [responses]);
  const mapViewport = useMemo(
    () => getMapViewport(city, responses),
    [city, responses]
  );

  const points = useMemo((): MapPoint[] => {
    return valid.map((r) => {
      const score = getResponseScore(r, selectedParameter);
      const tier = scoreToTier(score);
      return {
        id: r.id,
        lat: r.geo.coordinates!.lat,
        lng: r.geo.coordinates!.lng,
        color: tierColor(tier),
        radiusPixels: DOT_PIXEL_RADIUS,
        strokeWeight: 1.5,
        label: r.geo.localityName ?? "Survey point",
        scoreFive: scoreToFive(score),
        tier: tierLabel(tier),
        responseCount: 1,
      };
    });
  }, [valid, selectedParameter]);

  const handlePointClick = (point: MapPoint) => {
    setPopup({
      lat: point.lat,
      lng: point.lng,
      label: point.label,
      lines: [`${point.scoreFive} / 5 · ${point.tier}`],
    });
  };

  if (!mapsReady) {
    return <GoogleMapMissingKey className={className} />;
  }

  if (valid.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-border/50 bg-white text-sm text-muted-foreground shadow-sm ${className ?? ""}`}
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
          <SelectTrigger className="border-0 bg-white/95 shadow-md backdrop-blur-sm">
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

      <div className="absolute right-3 top-3 z-10 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur-sm">
        {city.name}
      </div>

      <Map
        defaultCenter={mapViewport.center}
        defaultZoom={mapViewport.zoom}
        {...DEFAULT_MAP_OPTIONS}
        style={{ width: "100%", height: "100%" }}
      >
        <TierCircles points={points} onPointClick={handlePointClick} />
        <MapInfoWindow popup={popup} onClose={() => setPopup(null)} />
      </Map>
    </MapShell>
  );
}
