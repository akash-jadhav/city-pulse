export type QualityRating =
  | "great"
  | "good"
  | "average"
  | "bad"
  | "horrible"
  | "unknown";

export type SafetyRating =
  | "completely_safe"
  | "quite_safe"
  | "sometimes_safe"
  | "not_safe"
  | "terrified"
  | "unknown";

export type HousingStatus = "tenant" | "homeowner" | "other";

export type CivicHazard =
  | "poor_garbage_collection"
  | "potholes_broken_roads"
  | "petty_crime_unsafe"
  | "water_logging"
  | "stray_animals"
  | "broken_streetlights"
  | "lack_of_parks"
  | "other";

export type BusinessChallenge =
  | "parking_congestion"
  | "lack_public_toilets"
  | "harassment_by_administration"
  | "garbage"
  | "electricity_tariffs"
  | "sealing_threats"
  | "other";

export type EmergencyResponse =
  | "system_works"
  | "know_but_ignored"
  | "no_idea"
  | "unknown";

export type NewsSource =
  | "social_media"
  | "domestic_worker"
  | "rwa"
  | "neighbours"
  | "newspapers"
  | "other";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeoRef {
  cityId: string;
  coordinates?: Coordinates;
  coordinatesValid?: boolean;
  zoneId?: string;
  wardId?: string;
  wardName?: string;
  areaId?: string;
  areaName?: string;
  localityId?: string;
  localityName?: string;
  neighborhoodId?: string;
  neighborhoodName?: string;
  pincode?: string;
}

export interface SurveyResponse {
  id: string;
  submittedAt: string;
  geo: GeoRef;
  demographics?: { age?: string; gender?: string };
  housingStatus: HousingStatus;
  electricityRating: QualityRating;
  electricityComment?: string;
  roadRating: QualityRating;
  roadComment?: string;
  civicHazards: CivicHazard[];
  safetyRating: SafetyRating;
  safetyComment?: string;
  businessChallenges: BusinessChallenge[];
  businessComment?: string;
  emergencyResponse: EmergencyResponse;
  newsSources: NewsSource[];
  loveText?: string;
  commentsText?: string;
}

export interface SurveyDataset {
  meta: {
    version: string;
    cityId: string;
    importedAt: string;
    source: "csv" | "json" | "mock";
    totalResponses: number;
    checksum?: string;
  };
  responses: SurveyResponse[];
}

export interface CityBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface CityConfig {
  id: string;
  name: string;
  country: string;
  slug: string;
  timezone: string;
  geoHierarchy: ("ward" | "area" | "locality" | "neighborhood")[];
  localityCount: number;
  defaultCenter: [number, number];
  bounds: CityBounds;
  dataFile: string;
}
