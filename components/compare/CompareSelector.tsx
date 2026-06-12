"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataset } from "@/providers/CityProvider";
import {
  clusterByCoordinates,
  compareToBaseline,
  computeScores,
} from "@/lib/analytics";
import {
  RadarCompareChart,
  GroupedCompareBar,
} from "@/components/charts/Charts";
import { Card, CardContent } from "@/components/ui/card";

export function CompareSelector() {
  const dataset = useDataset();
  const clusters = useMemo(
    () => clusterByCoordinates(dataset.responses).filter((c) => c.responseCount >= 3),
    [dataset.responses]
  );
  const cityScores = useMemo(
    () => computeScores(dataset.responses),
    [dataset.responses]
  );

  const [selectedId, setSelectedId] = useState(clusters[0]?.id ?? "");

  const selected = clusters.find((c) => c.id === selectedId);
  const comparison = selected
    ? compareToBaseline(selected.scores, cityScores)
    : [];

  return (
    <div className="space-y-6">
      <Select
        value={selectedId}
        onValueChange={(v) => v && setSelectedId(v)}
      >
        <SelectTrigger className="w-full max-w-sm">
          <SelectValue placeholder="Select area to compare" />
        </SelectTrigger>
        <SelectContent>
          {clusters.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.label} ({c.responseCount} responses)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selected && (
        <>
          <Card>
            <CardContent className="pt-6 text-sm">
              <strong>{selected.label}</strong> scores{" "}
              <strong>
                {selected.scores.overall - cityScores.overall > 0 ? "+" : ""}
                {selected.scores.overall - cityScores.overall}
              </strong>{" "}
              pts vs city average on overall health.
            </CardContent>
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <RadarCompareChart data={comparison} title="Dimension comparison" />
            <GroupedCompareBar data={comparison} title="Side by side" />
          </div>
        </>
      )}
    </div>
  );
}
