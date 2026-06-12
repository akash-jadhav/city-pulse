import { readFile } from "fs/promises";
import path from "path";
import { validateDataset } from "@/lib/data/schema";
import type { SurveyDataset } from "@/types/survey";

export async function loadDatasetFromFile(
  filePath: string
): Promise<SurveyDataset> {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const raw = await readFile(absolute, "utf-8");
  return validateDataset(JSON.parse(raw));
}

export async function loadCityDataset(citySlug: string): Promise<SurveyDataset> {
  const filePath = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "data",
    `${citySlug}.json`
  );
  return loadDatasetFromFile(filePath);
}

export async function loadCityDatasetPublic(
  dataFile: string
): Promise<SurveyDataset> {
  const res = await fetch(dataFile);
  if (!res.ok) throw new Error(`Failed to load dataset: ${dataFile}`);
  const data = await res.json();
  return validateDataset(data);
}
