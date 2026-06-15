"use client";

import { useMemo, useState } from "react";
import { useDataset, useCity } from "@/providers/CityProvider";
import { computeScores } from "@/lib/analytics";
import {
  type ParameterId,
  getParameterAverages,
  getScoreDistribution,
} from "@/lib/analytics/parameters";
import { ParameterPanel } from "@/components/dashboard/ParameterPanel";
import { ScoreLegend } from "@/components/dashboard/ScoreLegend";
import { BottomAnalyticsRow } from "@/components/dashboard/BottomAnalyticsRow";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { PulseMap } from "@/components/geo/PulseMap";
import {
  getLocalityCountForScores,
  getStatCardScopeLabel,
} from "@/config/cities/labels";

export function MapDashboardPage() {
  const dataset = useDataset();
  const city = useCity();
  const [selectedParameter, setSelectedParameter] = useState<ParameterId>("overall");

  const parameters = useMemo(
    () => getParameterAverages(dataset.responses),
    [dataset.responses]
  );
  const distribution = useMemo(
    () => getScoreDistribution(dataset.responses),
    [dataset.responses]
  );
  const scores = useMemo(
    () =>
      computeScores(
        dataset.responses,
        getLocalityCountForScores(city, dataset.responses.length)
      ),
    [dataset.responses, city]
  );

  const overallParam = parameters.find((p) => p.id === "overall");

  return (
    <div
      data-dashboard
      className="flex min-h-[calc(100dvh-3.5rem)] flex-col gap-4 bg-[var(--surface)] p-3 md:p-4 lg:p-5"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-4 lg:self-start">
          <ParameterPanel
            parameters={parameters}
            selectedId={selectedParameter}
            onSelect={setSelectedParameter}
          />
          <ScoreLegend />
        </aside>

        <div className="flex h-full min-h-[320px] flex-col">
          <PulseMap
            responses={dataset.responses}
            selectedParameter={selectedParameter}
            onParameterChange={setSelectedParameter}
            className="h-full min-h-[320px] flex-1"
          />
        </div>
      </div>

      <BottomAnalyticsRow
        total={scores.responseCount}
        cityName={getStatCardScopeLabel(city)}
        overallFive={overallParam?.scoreFive ?? 0}
        overall100={scores.overall}
        parameters={parameters}
        distribution={distribution}
      />

      <DashboardFooter />
    </div>
  );
}
