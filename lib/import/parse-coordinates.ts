import type { CityBounds, Coordinates } from "@/types/survey";

export function parseCoordinates(
  raw: string | undefined | null
): Coordinates | null {
  if (!raw?.trim()) return null;

  let cleaned = raw.trim();
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  const parts = cleaned.split(",").map((p) => p.trim());
  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
}

export function isWithinBounds(
  coords: Coordinates,
  bounds: CityBounds
): boolean {
  return (
    coords.lat >= bounds.south &&
    coords.lat <= bounds.north &&
    coords.lng >= bounds.west &&
    coords.lng <= bounds.east
  );
}
