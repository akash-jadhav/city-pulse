import { readFile, readdir } from "fs/promises";
import path from "path";
import { validateDataset } from "@/lib/data/schema";
import type { SurveyDataset, SurveyResponse } from "@/types/survey";

export async function loadDatasetFromFile(
  filePath: string
): Promise<SurveyDataset> {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const raw = await readFile(absolute, "utf-8");
  return validateDataset(JSON.parse(raw));
}

async function mergeAllCityDatasets(
  dataDir: string
): Promise<SurveyDataset> {
  const files = await readdir(dataDir);
  const jsonFiles = files.filter(
    (file) => file.endsWith(".json") && file !== "cities.json"
  );

  const responses: SurveyResponse[] = [];
  for (const file of jsonFiles) {
    if (file === "india.json") continue;
    const dataset = await loadDatasetFromFile(path.join(dataDir, file));
    responses.push(...dataset.responses);
  }

  return {
    meta: {
      version: "1.0.0",
      cityId: "india",
      importedAt: new Date().toISOString(),
      source: "csv",
      totalResponses: responses.length,
    },
    responses,
  };
}

export async function loadCityDataset(citySlug: string): Promise<SurveyDataset> {
  const dataDir = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "data"
  );
  const filePath = path.join(dataDir, `${citySlug}.json`);

  if (citySlug === "india") {
    try {
      return await loadDatasetFromFile(filePath);
    } catch {
      return mergeAllCityDatasets(dataDir);
    }
  }

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
