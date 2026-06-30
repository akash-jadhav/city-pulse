"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Circle, useMap } from "@vis.gl/react-google-maps";
import { cn } from "@/lib/utils";
import { hasGoogleMapsApiKey } from "@/providers/GoogleMapsProvider";
import {
  DEFAULT_ZOOM,
  DOT_PIXEL_RADIUS,
  getMapStylesForTheme,
  MAP_CIRCLE_STROKE,
  metersForPixelRadius,
} from "@/components/geo/map-config";
import { useTheme } from "@/providers/ThemeProvider";
import { ResponseDetailTooltip } from "@/components/geo/ResponseDetailTooltip";
import type { ResponseDetailSection } from "@/lib/analytics/response-detail";

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
  responseId?: string;
}

export interface MapPopupState {
  lat: number;
  lng: number;
  label: string;
  subtitle?: string;
  averageScoreFive?: number;
  averageTier?: string;
  sections?: ResponseDetailSection[];
  overallStars?: string;
}

const HOVER_LEAVE_DELAY_MS = 200;
const TOOLTIP_GAP_PX = 12;
const MARKER_OFFSET_PX = 14;
const TOOLTIP_EDGE_MARGIN_PX = 8;
const TOOLTIP_HEIGHT_ESTIMATE_PX = 200;
const TOOLTIP_PORTAL_Z_INDEX = 9999;

interface TooltipPosition {
  x: number;
  y: number;
  openBelow: boolean;
  visible: boolean;
}

function computeTooltipOpenBelow(
  spaceAbove: number,
  spaceBelow: number,
  needHeight: number
): boolean {
  const fitsAbove = spaceAbove >= needHeight;
  const fitsBelow = spaceBelow >= needHeight;

  if (fitsBelow && !fitsAbove) return true;
  if (fitsAbove && !fitsBelow) return false;
  if (fitsAbove && fitsBelow) return false;
  return spaceBelow > spaceAbove;
}

interface MapHoverDismissContextValue {
  scheduleDismiss: () => void;
  cancelDismiss: () => void;
}

const MapHoverDismissContext =
  createContext<MapHoverDismissContextValue | null>(null);

function useMapHoverDismiss(): MapHoverDismissContextValue {
  const context = useContext(MapHoverDismissContext);
  if (!context) {
    throw new Error(
      "useMapHoverDismiss must be used within MapHoverDismissProvider"
    );
  }
  return context;
}

export function MapHoverDismissProvider({
  onDismiss,
  children,
}: {
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const cancelDismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleDismiss = useCallback(() => {
    cancelDismiss();
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      onDismissRef.current();
    }, HOVER_LEAVE_DELAY_MS);
  }, [cancelDismiss]);

  useEffect(() => cancelDismiss, [cancelDismiss]);

  const value = useMemo(
    () => ({ scheduleDismiss, cancelDismiss }),
    [scheduleDismiss, cancelDismiss]
  );

  return (
    <MapHoverDismissContext.Provider value={value}>
      {children}
    </MapHoverDismissContext.Provider>
  );
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
        "flex items-center justify-center rounded-2xl border border-border/50 bg-card p-4 text-center text-sm text-muted-foreground shadow-sm",
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
        "relative overflow-visible rounded-2xl border border-border/50 shadow-sm",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function MapThemeSync() {
  const map = useMap();
  const { theme } = useTheme();

  useEffect(() => {
    if (!map) return;
    map.setOptions({ styles: getMapStylesForTheme(theme) });
  }, [map, theme]);

  return null;
}

export function TierCircles({
  points,
  onPointHover,
  onPointClick,
}: {
  points: MapPoint[];
  onPointHover: (point: MapPoint | null) => void;
  onPointClick?: (point: MapPoint) => void;
}) {
  const zoom = useMapZoom();
  const { theme } = useTheme();
  const { scheduleDismiss, cancelDismiss } = useMapHoverDismiss();
  const circleStroke = MAP_CIRCLE_STROKE[theme];

  const handleMouseOver = (point: MapPoint) => {
    cancelDismiss();
    onPointHover(point);
  };

  const handleMouseOut = () => {
    scheduleDismiss();
  };

  return (
    <>
      {points.map((point) => (
        <Circle
          key={point.id}
          center={{ lat: point.lat, lng: point.lng }}
          radius={metersForPixelRadius(point.lat, zoom, point.radiusPixels)}
          fillColor={point.color}
          fillOpacity={0.88}
          strokeColor={circleStroke}
          strokeWeight={point.strokeWeight}
          clickable
          onMouseOver={() => handleMouseOver(point)}
          onMouseOut={handleMouseOut}
          onClick={() => onPointClick?.(point)}
        />
      ))}
    </>
  );
}

function MapHoverOverlay({ popup }: { popup: MapPopupState }) {
  const map = useMap();
  const { scheduleDismiss, cancelDismiss } = useMapHoverDismiss();
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef(popup);
  popupRef.current = popup;

  const updatePosition = useCallback(() => {
    overlayRef.current?.draw();
  }, []);

  useEffect(() => {
    if (!map) return;

    const anchorEl = document.createElement("div");
    anchorEl.style.position = "absolute";
    anchorEl.style.width = "1px";
    anchorEl.style.height = "1px";
    anchorEl.style.pointerEvents = "none";

    class TooltipOverlay extends google.maps.OverlayView {
      onAdd() {
        this.getPanes()?.floatPane.appendChild(anchorEl);
      }

      draw() {
        const projection = this.getProjection();
        const current = popupRef.current;
        if (!projection || !current) {
          setPosition(null);
          return;
        }

        const point = projection.fromLatLngToDivPixel(
          new google.maps.LatLng(current.lat, current.lng)
        );
        if (!point) return;

        anchorEl.style.left = `${point.x}px`;
        anchorEl.style.top = `${point.y}px`;

        const { left, top, width, height } = anchorEl.getBoundingClientRect();
        let anchorX = left + width / 2;
        const anchorY = top + height / 2;

        const tooltipHeight =
          tooltipRef.current?.offsetHeight || TOOLTIP_HEIGHT_ESTIMATE_PX;
        const needHeight =
          tooltipHeight +
          TOOLTIP_GAP_PX +
          MARKER_OFFSET_PX +
          TOOLTIP_EDGE_MARGIN_PX;

        const spaceAbove = anchorY;
        const spaceBelow = window.innerHeight - anchorY;
        const openBelow = computeTooltipOpenBelow(
          spaceAbove,
          spaceBelow,
          needHeight
        );

        const halfWidth = (tooltipRef.current?.offsetWidth ?? 320) / 2;
        const margin = 8;
        anchorX = Math.min(
          Math.max(anchorX, halfWidth + margin),
          window.innerWidth - halfWidth - margin
        );

        setPosition((prev) => {
          const next: TooltipPosition = {
            x: anchorX,
            y: anchorY,
            openBelow,
            visible: true,
          };
          if (
            prev &&
            prev.visible === next.visible &&
            prev.x === next.x &&
            prev.y === next.y &&
            prev.openBelow === next.openBelow
          ) {
            return prev;
          }
          return next;
        });
      }

      onRemove() {
        anchorEl.remove();
      }
    }

    const overlay = new TooltipOverlay();
    overlayRef.current = overlay;
    overlay.setMap(map);

    const listeners = [
      map.addListener("bounds_changed", updatePosition),
      map.addListener("zoom_changed", updatePosition),
      map.addListener("idle", updatePosition),
    ];
    const handleViewportChange = () => updatePosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      listeners.forEach((listener) => listener.remove());
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      overlay.setMap(null);
      overlayRef.current = null;
      setPosition(null);
    };
  }, [map, updatePosition]);

  useLayoutEffect(() => {
    updatePosition();
  }, [popup, updatePosition]);

  const offset = MARKER_OFFSET_PX + TOOLTIP_GAP_PX;
  const positionedStyle: React.CSSProperties = position?.visible
    ? {
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: TOOLTIP_PORTAL_Z_INDEX,
        transform: position.openBelow
          ? `translate(-50%, ${offset}px)`
          : `translate(-50%, calc(-100% - ${offset}px))`,
      }
    : {
        position: "fixed",
        left: 0,
        top: 0,
        visibility: "hidden",
        pointerEvents: "none",
      };

  return createPortal(
    <div
      ref={tooltipRef}
      className="pointer-events-auto py-2"
      style={positionedStyle}
      onMouseEnter={cancelDismiss}
      onMouseLeave={scheduleDismiss}
      onWheel={(e) => e.stopPropagation()}
    >
      <ResponseDetailTooltip
        label={popup.label}
        subtitle={popup.subtitle}
        averageScoreFive={popup.averageScoreFive}
        averageTier={popup.averageTier}
        overallStars={popup.overallStars}
        sections={popup.sections}
      />
    </div>,
    document.body
  );
}

export function MapInfoWindow({ popup }: { popup: MapPopupState | null }) {
  if (!popup) return null;
  return <MapHoverOverlay popup={popup} />;
}

export function useMapClickClear(
  enabled: boolean,
  onClear: () => void
): void {
  const map = useMap();

  useEffect(() => {
    if (!map || !enabled) return;

    const listener = map.addListener("click", onClear);
    return () => listener.remove();
  }, [map, enabled, onClear]);
}

export function MapTouchDismiss({
  enabled,
  onClear,
}: {
  enabled: boolean;
  onClear: () => void;
}) {
  useMapClickClear(enabled, onClear);
  return null;
}

export function useGoogleMapsReady(): boolean {
  return hasGoogleMapsApiKey();
}

export function useTouchOnlyMap(): boolean {
  const [touchOnly, setTouchOnly] = useState(false);

  useEffect(() => {
    setTouchOnly(window.matchMedia("(hover: none)").matches);
  }, []);

  return touchOnly;
}
