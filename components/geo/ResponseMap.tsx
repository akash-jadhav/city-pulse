"use client";

import { useMemo, useState, useCallback } from "react";
import Map, { Layer, Source, NavigationControl, Popup } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
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
import { clusterPaint, DEFAULT_ZOOM, MAP_STYLE } from "@/components/geo/map-config";

interface ResponseMapProps {
  responses: SurveyResponse[];
  clusters?: GeoCluster[];
  onSelect?: (id: string) => void;
  selectedId?: string;
  height?: string;
}

interface PopupInfo {
  lng: number;
  lat: number;
  label: string;
  lines: string[];
}

function clusterRadius(count: number): number {
  return Math.min(8 + count * 2, 24);
}

export function ResponseMap({
  responses,
  clusters,
  onSelect,
  selectedId,
  height = "400px",
}: ResponseMapProps) {
  const city = useCity();
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const valid = useMemo(() => filterValidMapResponses(responses), [responses]);

  const geojson = useMemo(() => {
    if (clusters) {
      return {
        type: "FeatureCollection" as const,
        features: clusters.map((c) => {
          const tier = scoreToTier(c.scores.overall);
          return {
            type: "Feature" as const,
            properties: {
              id: c.id,
              color: tierColor(tier),
              radius: clusterRadius(c.responseCount),
              strokeWidth: selectedId === c.id ? 4 : 2,
              label: c.label,
              responseCount: c.responseCount,
              scoreFive: scoreToFive(c.scores.overall),
              tier: tierLabel(tier),
            },
            geometry: {
              type: "Point" as const,
              coordinates: [c.lng, c.lat],
            },
          };
        }),
      };
    }

    return {
      type: "FeatureCollection" as const,
      features: valid.map((r) => {
        const score = getResponseScore(r, "overall");
        const tier = scoreToTier(score);
        return {
          type: "Feature" as const,
          properties: {
            id: r.id,
            color: tierColor(tier),
            radius: 7,
            strokeWidth: 2,
            label: r.geo.localityName ?? "Survey point",
            responseCount: 1,
            scoreFive: scoreToFive(score),
            tier: tierLabel(tier),
          },
          geometry: {
            type: "Point" as const,
            coordinates: [r.geo.coordinates!.lng, r.geo.coordinates!.lat],
          },
        };
      }),
    };
  }, [clusters, valid, selectedId]);

  const layerId = clusters ? "cluster-dots" : "response-dots";

  const onClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature?.geometry || feature.geometry.type !== "Point") return;
      const [lng, lat] = feature.geometry.coordinates;
      const id = feature.properties?.id;
      const label = feature.properties?.label ?? "Point";
      const responseCount = feature.properties?.responseCount ?? 1;
      const scoreFive = feature.properties?.scoreFive ?? 0;
      const tier = feature.properties?.tier ?? "";

      if (clusters && id && onSelect) {
        onSelect(id);
      }

      setPopup({
        lng,
        lat,
        label,
        lines:
          responseCount > 1
            ? [
                `${responseCount} responses`,
                `${scoreFive} / 5 · ${tier}`,
              ]
            : [`${scoreFive} / 5 · ${tier}`],
      });
    },
    [clusters, onSelect]
  );

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
    <div
      className="overflow-hidden rounded-2xl border border-border/50 shadow-sm"
      style={{ height }}
    >
      <Map
        initialViewState={{
          longitude: city.defaultCenter[1],
          latitude: city.defaultCenter[0],
          zoom: DEFAULT_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={[layerId]}
        onClick={onClick}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <Source id="map-points" type="geojson" data={geojson}>
          <Layer
            id={layerId}
            type="circle"
            paint={clusterPaint()}
          />
        </Source>
        {popup && (
          <Popup
            longitude={popup.lng}
            latitude={popup.lat}
            anchor="bottom"
            onClose={() => setPopup(null)}
            closeButton
            closeOnClick={false}
          >
            <div className="text-sm">
              <p className="font-semibold">{popup.label}</p>
              {popup.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
