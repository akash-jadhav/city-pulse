"use client";

import { useMemo, useState } from "react";
import { Map } from "@vis.gl/react-google-maps";
import type { GeoCluster } from "@/types/analytics";
import type { SurveyResponse } from "@/types/survey";
import { filterValidMapResponses } from "@/lib/analytics";
import {
  getResponseScore,
  scoreToFive,
  scoreToTier,
  tierColor,
  tierLabel,
} from "@/lib/analytics/parameters";
import { useCity } from "@/providers/CityProvider";
import { getMapViewport } from "@/lib/geo/map-viewport";
import {
  clusterPixelRadius,
  DEFAULT_MAP_OPTIONS,
  DOT_PIXEL_RADIUS,
} from "@/components/geo/map-config";
import {
  GoogleMapMissingKey,
  MapInfoWindow,
  MapShell,
  type MapPoint,
  type MapPopupState,
  TierCircles,
  useGoogleMapsReady,
} from "@/components/geo/google-map-shared";

interface ResponseMapProps {
  responses: SurveyResponse[];
  clusters?: GeoCluster[];
  onSelect?: (id: string) => void;
  selectedId?: string;
  height?: string;
}

export function ResponseMap({
  responses,
  clusters,
  onSelect,
  selectedId,
  height = "400px",
}: ResponseMapProps) {
  const city = useCity();
  const mapsReady = useGoogleMapsReady();
  const [popup, setPopup] = useState<MapPopupState | null>(null);
  const valid = useMemo(() => filterValidMapResponses(responses), [responses]);
  const mapViewport = useMemo(
    () => getMapViewport(city, responses),
    [city, responses]
  );

  const points = useMemo((): MapPoint[] => {
    if (clusters) {
      return clusters.map((c) => {
        const tier = scoreToTier(c.scores.overall);
        return {
          id: c.id,
          lat: c.lat,
          lng: c.lng,
          color: tierColor(tier),
          radiusPixels: clusterPixelRadius(c.responseCount),
          strokeWeight: selectedId === c.id ? 3 : 1.5,
          label: c.label,
          scoreFive: scoreToFive(c.scores.overall),
          tier: tierLabel(tier),
          responseCount: c.responseCount,
        };
      });
    }

    return valid.map((r) => {
      const score = getResponseScore(r, "overall");
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
  }, [clusters, valid, selectedId]);

  const handlePointClick = (point: MapPoint) => {
    if (clusters && onSelect) {
      onSelect(point.id);
    }

    setPopup({
      lat: point.lat,
      lng: point.lng,
      label: point.label,
      lines:
        point.responseCount > 1
          ? [
              `${point.responseCount} responses`,
              `${point.scoreFive} / 5 · ${point.tier}`,
            ]
          : [`${point.scoreFive} / 5 · ${point.tier}`],
    });
  };

  if (!mapsReady) {
    return <GoogleMapMissingKey height={height} />;
  }

  if (valid.length === 0 && !clusters?.length) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-border/50 bg-white text-sm text-muted-foreground shadow-sm"
        style={{ height }}
      >
        No valid coordinates to display on map
      </div>
    );
  }

  return (
    <MapShell style={{ height }}>
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
