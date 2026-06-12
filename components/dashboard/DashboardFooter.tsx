"use client";

import { useDataset } from "@/providers/CityProvider";
import { Badge } from "@/components/ui/badge";

export function DashboardFooter() {
  const dataset = useDataset();
  const date = new Date(dataset.meta.importedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <footer className="flex flex-col items-center justify-between gap-2 rounded-xl bg-white/80 px-4 py-2 text-xs text-muted-foreground shadow-sm md:flex-row">
      <span>Last updated: {date}</span>
      <span className="flex items-center gap-2">
        Data collected via Google Forms
        <Badge variant="secondary" className="text-[10px]">
          {dataset.meta.source === "mock" ? "Demo data" : "Live survey"}
        </Badge>
      </span>
      <span>Community reported · subject to verification</span>
    </footer>
  );
}
