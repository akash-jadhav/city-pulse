"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useDataset, useCity } from "@/providers/CityProvider";
import {
  computeScores,
  getStrengthsAndConcerns,
  clusterByCoordinates,
} from "@/lib/analytics";
import {
  DashboardLayout,
  SectionHeader,
} from "@/components/layouts/DashboardLayout";
import { CityHealthGauge } from "@/components/charts/Charts";
import { StrengthsConcernsPanel } from "@/components/insights/Insights";
import { ResponseMap } from "@/components/geo/ResponseMap";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CityOverviewPage() {
  const dataset = useDataset();
  const city = useCity();
  const scores = useMemo(
    () => computeScores(dataset.responses, city.localityCount),
    [dataset.responses, city.localityCount]
  );
  const { strengths, concerns } = useMemo(
    () => getStrengthsAndConcerns(dataset.responses),
    [dataset.responses]
  );
  const clusters = useMemo(
    () =>
      [...clusterByCoordinates(dataset.responses)].sort(
        (a, b) => b.scores.overall - a.scores.overall
      ),
    [dataset.responses]
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          eyebrow="City overview"
          title={`${city.name} at a glance`}
          description="Composite health, strengths, concerns, and neighborhood comparisons"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <CityHealthGauge score={scores.overall} />
          <div className="lg:col-span-2">
            <StrengthsConcernsPanel strengths={strengths} concerns={concerns} />
          </div>
        </div>

        <div className="mt-8">
          <SectionHeader title="Response map" description="Score-colored clusters across the city" />
          <ResponseMap responses={dataset.responses} clusters={clusters} />
        </div>

        <div className="mt-8">
          <SectionHeader title="Neighborhood comparison" />
          <Card>
            <CardContent className="overflow-x-auto pt-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Area</th>
                    <th className="pb-2 pr-4">Responses</th>
                    <th className="pb-2 pr-4">Overall</th>
                    <th className="pb-2 pr-4">Safety</th>
                    <th className="pb-2">Infrastructure</th>
                  </tr>
                </thead>
                <tbody>
                  {clusters.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{c.label}</td>
                      <td className="py-3 pr-4">{c.responseCount}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{c.scores.overall}</Badge>
                      </td>
                      <td className="py-3 pr-4">{c.scores.safety}</td>
                      <td className="py-3">{c.scores.infrastructure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
