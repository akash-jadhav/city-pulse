"use client";

import { useCallback, useMemo, useState } from "react";
import { Map as GoogleMap } from "@vis.gl/react-google-maps";
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
import {
  buildResponseDetailSections,
  getResponseAverageHeader,
  getResponseHoverLabel,
} from "@/lib/analytics/response-detail";
import { useCity } from "@/providers/CityProvider";
import { getMapViewport } from "@/lib/geo/map-viewport";
import {
  clusterPixelRadius,
  DEFAULT_MAP_OPTIONS,
  DOT_PIXEL_RADIUS,
} from "@/components/geo/map-config";
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
  const touchOnly = useTouchOnlyMap();
  const [popup, setPopup] = useState<MapPopupState | null>(null);
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
  }, [clusters, valid, selectedId]);

  const showPointPopup = useCallback(
    (point: MapPoint) => {
      if (clusters) {
        setPopup({
          lat: point.lat,
          lng: point.lng,
          label: point.label,
          subtitle: `${point.responseCount} response${point.responseCount !== 1 ? "s" : ""}`,
          averageScoreFive: point.scoreFive,
          averageTier: point.tier,
        });
        return;
      }

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
    [clusters, responseById]
  );

  const handlePointHover = useCallback(
    (point: MapPoint | null) => {
      if (touchOnly) return;
      if (!point) {
        setPopup(null);
        return;
      }
      showPointPopup(point);
    },
    [showPointPopup, touchOnly]
  );

  const handlePointClick = useCallback(
    (point: MapPoint) => {
      if (clusters && onSelect) {
        onSelect(point.id);
      }

      if (touchOnly || clusters) {
        showPointPopup(point);
      }
    },
    [clusters, onSelect, showPointPopup, touchOnly]
  );

  const clearPopup = useCallback(() => setPopup(null), []);

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
