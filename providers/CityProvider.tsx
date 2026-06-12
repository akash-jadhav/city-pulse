"use client";

import { createContext, useContext } from "react";
import type { CityConfig, SurveyDataset } from "@/types/survey";

interface CityContextValue {
  city: CityConfig;
  dataset: SurveyDataset;
}

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({
  city,
  dataset,
  children,
}: CityContextValue & { children: React.ReactNode }) {
  return (
    <CityContext.Provider value={{ city, dataset }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCityContext must be used within CityProvider");
  return ctx;
}

export function useDataset() {
  return useCityContext().dataset;
}

export function useCity() {
  return useCityContext().city;
}
