"use client";

import { useDataset } from "@/providers/CityProvider";
import { Badge } from "@/components/ui/badge";

export function DataFreshnessBanner() {
  const dataset = useDataset();
  const date = new Date(dataset.meta.importedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="border-t bg-muted/40 px-4 py-1.5 text-center text-xs text-muted-foreground md:px-8">
      <span className="mr-2">{dataset.meta.totalResponses} responses</span>
      <span className="mr-2">· Last updated {date}</span>
      <Badge variant="secondary" className="text-[10px]">
        {dataset.meta.source === "mock" ? "Demo data" : "Live survey data"}
      </Badge>
    </div>
  );
}
