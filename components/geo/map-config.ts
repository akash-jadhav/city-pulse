export const DEFAULT_ZOOM = 10.5;
export const DEFAULT_INDIA_ZOOM = 4.5;

/** Target on-screen dot size in pixels (matches old MapLibre circle-radius: 7). */
export const DOT_PIXEL_RADIUS = 7;

export function clusterPixelRadius(responseCount: number): number {
  return Math.min(8 + responseCount * 2, 24);
}

export function metersPerPixel(lat: number, zoom: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

export function metersForPixelRadius(
  lat: number,
  zoom: number,
  pixels: number
): number {
  return pixels * metersPerPixel(lat, zoom);
}

/**
 * Carto Positron-inspired style: light grey canvas, muted water, clean roads,
 * neighborhood labels — no POI pin clutter (matches former MapLibre basemap).
 * @see https://developers.google.com/maps/documentation/javascript/style-reference
 */
export const POSITRON_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4e4ec" }] },
  { featureType: "water", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f2f2f2" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e8e8e8" }] },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#fafafa" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e0e0e0" }],
  },
  {
    featureType: "road.local",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }],
  },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e8ede8" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
];

export const DEFAULT_MAP_OPTIONS: Pick<
  google.maps.MapOptions,
  "gestureHandling" | "disableDefaultUI" | "mapTypeControl" | "fullscreenControl" | "styles" | "clickableIcons"
> = {
  gestureHandling: "greedy",
  disableDefaultUI: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  styles: POSITRON_MAP_STYLES,
};
