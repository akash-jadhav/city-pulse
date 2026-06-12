"use client";

import { useMemo, useState, useCallback } from "react";
import Map, { Layer, Source, NavigationControl, Popup } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
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
import { DEFAULT_ZOOM, dotPaint, MAP_STYLE } from "@/components/geo/map-config";

interface PulseMapProps {
  responses: SurveyResponse[];
  selectedParameter: ParameterId;
  onParameterChange: (id: ParameterId) => void;
  className?: string;
}

interface PopupInfo {
  lng: number;
  lat: number;
  label: string;
  scoreFive: number;
  tier: string;
}

export function PulseMap({
  responses,
  selectedParameter,
  onParameterChange,
  className,
}: PulseMapProps) {
  const city = useCity();
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const parameters = useMemo(() => getParameterAverages(responses), [responses]);
  const valid = useMemo(() => filterValidMapResponses(responses), [responses]);

  const geojson = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: valid.map((r) => {
        const score = getResponseScore(r, selectedParameter);
        const tier = scoreToTier(score);
        return {
          type: "Feature" as const,
          properties: {
            id: r.id,
            color: tierColor(tier),
            label: r.geo.localityName ?? "Survey point",
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
  }, [valid, selectedParameter]);

  const onClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature?.geometry || feature.geometry.type !== "Point") return;
    const [lng, lat] = feature.geometry.coordinates;
    setPopup({
      lng,
      lat,
      label: feature.properties?.label ?? "Point",
      scoreFive: feature.properties?.scoreFive ?? 0,
      tier: feature.properties?.tier ?? "",
    });
  }, []);

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
    <div className={`relative overflow-hidden rounded-2xl border border-border/50 shadow-sm ${className ?? ""}`}>
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
        initialViewState={{
          longitude: city.defaultCenter[1],
          latitude: city.defaultCenter[0],
          zoom: DEFAULT_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={["pulse-dots"]}
        onClick={onClick}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <Source id="responses" type="geojson" data={geojson}>
          <Layer
            id="pulse-dots"
            type="circle"
            paint={dotPaint()}
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
              <p>
                {popup.scoreFive} / 5 · {popup.tier}
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
