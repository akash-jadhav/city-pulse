export const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export const DEFAULT_ZOOM = 10.5;

export function dotPaint(strokeWidth: number | ["get", string] = 2) {
  return {
    "circle-radius": 7,
    "circle-color": ["get", "color"] as ["get", string],
    "circle-stroke-width": strokeWidth,
    "circle-stroke-color": "#ffffff",
    "circle-opacity": 0.92,
  };
}

export function clusterPaint() {
  return {
    "circle-radius": ["get", "radius"] as ["get", string],
    "circle-color": ["get", "color"] as ["get", string],
    "circle-stroke-width": ["get", "strokeWidth"] as ["get", string],
    "circle-stroke-color": "#ffffff",
    "circle-opacity": 0.92,
  };
}
