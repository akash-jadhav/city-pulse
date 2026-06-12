import { z } from "zod";
import type { SurveyDataset } from "@/types/survey";

const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const geoRefSchema = z.object({
  cityId: z.string(),
  coordinates: coordinatesSchema.optional(),
  coordinatesValid: z.boolean().optional(),
  zoneId: z.string().optional(),
  wardId: z.string().optional(),
  wardName: z.string().optional(),
  areaId: z.string().optional(),
  areaName: z.string().optional(),
  localityId: z.string().optional(),
  localityName: z.string().optional(),
  neighborhoodId: z.string().optional(),
  neighborhoodName: z.string().optional(),
  pincode: z.string().optional(),
});

const surveyResponseSchema = z.object({
  id: z.string(),
  submittedAt: z.string(),
  geo: geoRefSchema,
  demographics: z
    .object({
      age: z.string().optional(),
      gender: z.string().optional(),
    })
    .optional(),
  housingStatus: z.enum(["tenant", "homeowner", "other"]),
  electricityRating: z.enum([
    "great",
    "good",
    "average",
    "bad",
    "horrible",
    "unknown",
  ]),
  electricityComment: z.string().optional(),
  roadRating: z.enum([
    "great",
    "good",
    "average",
    "bad",
    "horrible",
    "unknown",
  ]),
  roadComment: z.string().optional(),
  civicHazards: z.array(z.string()),
  safetyRating: z.enum([
    "completely_safe",
    "quite_safe",
    "sometimes_safe",
    "not_safe",
    "terrified",
    "unknown",
  ]),
  safetyComment: z.string().optional(),
  businessChallenges: z.array(z.string()),
  businessComment: z.string().optional(),
  emergencyResponse: z.enum([
    "system_works",
    "know_but_ignored",
    "no_idea",
    "unknown",
  ]),
  newsSources: z.array(z.string()),
  loveText: z.string().optional(),
  commentsText: z.string().optional(),
});

export const surveyDatasetSchema = z.object({
  meta: z.object({
    version: z.string(),
    cityId: z.string(),
    importedAt: z.string(),
    source: z.enum(["csv", "json", "mock"]),
    totalResponses: z.number(),
    checksum: z.string().optional(),
  }),
  responses: z.array(surveyResponseSchema),
});

export function validateDataset(data: unknown): SurveyDataset {
  return surveyDatasetSchema.parse(data) as SurveyDataset;
}
