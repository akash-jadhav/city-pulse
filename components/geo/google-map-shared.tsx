"use client";

import { useEffect, useState } from "react";
import { Circle, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { cn } from "@/lib/utils";
import { hasGoogleMapsApiKey } from "@/providers/GoogleMapsProvider";
import {
  DEFAULT_ZOOM,
  metersForPixelRadius,
} from "@/components/geo/map-config";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  color: string;
  radiusPixels: number;
  strokeWeight: number;
  label: string;
  scoreFive: number;
  tier: string;
  responseCount: number;
}

export interface MapPopupState {
  lat: number;
  lng: number;
  label: string;
  lines: string[];
}

function useMapZoom(): number {
  const map = useMap();
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    if (!map) return;

    const update = () => setZoom(map.getZoom() ?? DEFAULT_ZOOM);
    update();

    const listener = map.addListener("zoom_changed", update);
    return () => listener.remove();
  }, [map]);

  return zoom;
}

export function GoogleMapMissingKey({
  className,
  height,
}: {
  className?: string;
  height?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-border/50 bg-white p-4 text-center text-sm text-muted-foreground shadow-sm",
        className
      )}
      style={height ? { height } : undefined}
    >
      <p>
        Add <code className="text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to{" "}
        <code className="text-xs">.env.local</code> (and Vercel env vars) to load
        Google Maps.
      </p>
    </div>
  );
}

export function MapShell({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 shadow-sm",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function TierCircles({
  points,
  onPointClick,
}: {
  points: MapPoint[];
  onPointClick: (point: MapPoint) => void;
}) {
  const zoom = useMapZoom();

  return (
    <>
      {points.map((point) => (
        <Circle
          key={point.id}
          center={{ lat: point.lat, lng: point.lng }}
          radius={metersForPixelRadius(point.lat, zoom, point.radiusPixels)}
          fillColor={point.color}
          fillOpacity={0.88}
          strokeColor="#ffffff"
          strokeWeight={point.strokeWeight}
          clickable
          onClick={() => onPointClick(point)}
        />
      ))}
    </>
  );
}

export function MapInfoWindow({
  popup,
  onClose,
}: {
  popup: MapPopupState | null;
  onClose: () => void;
}) {
  if (!popup) return null;

  return (
    <InfoWindow
      position={{ lat: popup.lat, lng: popup.lng }}
      onCloseClick={onClose}
    >
      <div className="text-sm">
        <p className="font-semibold">{popup.label}</p>
        {popup.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </InfoWindow>
  );
}

export function useGoogleMapsReady(): boolean {
  return hasGoogleMapsApiKey();
}
